import { fetchBootstrapData } from "./mock-api-calls.js";
import { globalState } from "./script.js"
import * as singlepost from "./singlepost.js"
import { showAlert, createObserver, updateNewPostCount, updateGlobalState } from "./utils.js";
import { fetchJwt } from "./jwt_fetch.js"
import { showPage } from "./navigation.js";
import { setupReactions } from './reactions.js'
import { getItemId, assignIfExists, formatDate } from "./utils.js";
import { audio } from "./audio.js"
import { handleSub } from "./websocket.js";

export async function loadPosts() {
  console.log("LOAD POSTS")
  const home = document.getElementById("home-page");
  fetchMore(home, 10, "postsFeed");
}

export function createPostItem(item, initial = false) {
  const card = document.createElement("div");

  const isNew = !initial;
  const unreadClass = isNew ? 'unread' : '';
  card.className = `post-card ${unreadClass}`;
  card.dataset.id = item.id;

  const userReactions = item.current_user_reactions || [];


  card.innerHTML = `
      <div class="post-header">
        <div class="avatar">${item.creator.avatar}</div>
        <span class="post-author">${item.creator.username}</span>
        <span class="post-time">${formatDate(item.created_at)}</span>
      </div>
      <h3 class="post-title">${item.title}</h3>
      <div class="post-content">${item.body}</div>
      <div class="post-actions">
         <button class="action-btn add-reaction-btn" data-post-id="${item.id}">
          <img src="assets/img/addreaction.svg">
    </button>
        <span class="comments-count">💬 ${item.comment_count}</span>
      </div>
     <div class="post-tags">
  ${(item.categories ?? []).map(category => `<span class="category">${category.name}</span>`).join('')}
</div>
    `;


  // Setup reactions using the generalized function
  setupReactions(card, item.id, item, userReactions);

  return { card };
}

export async function renderPosts(postIds, initial = false, div, entityType = "postFeed") {
  const container = document.getElementById(div);
  console.log("Rendering posts in", div, "with IDs:", postIds);

  if (!container) return;

  //container.innerHTML = "";
  postIds.forEach(postId => {
    const post = globalState[entityType].byId[postId];
    if (!post) return
    const { card } = createPostItem(post, initial);
    const previousScrollTop = container.scrollTop;

    // Only the title opens the post page
    const titleEl = card.querySelector(".post-title");
    titleEl.addEventListener("click", () => {
      globalState.singlePost = post;
      globalState.singlePostComments.allIds = [];
      globalState.singlePostComments.byId = {};
      globalState.singlePostComments.fetchMore = true;
      singlepost.showPost()
    });

    titleEl.addEventListener("mouseenter", () => {  titleEl.style.color = "#f06c00"; });
    titleEl.addEventListener("mouseleave", () => { titleEl.style.color = "#2d3748"; });

    // WEBSOCKET: Add sub for comment count and reactions for each post
    handleSub([postId], "su:")
    // Hold Websockets on GlobalStatus.posts.byId to remove if deleted from cache

    if (card) {
      if (initial) {
        container.appendChild(card)
      } else {
        container.prepend(card);
        const style = window.getComputedStyle(card);
        const marginBottom = parseInt(style.marginBottom, 10);
        const newItemHeight = card.offsetHeight + marginBottom;
        container.scrollTop = previousScrollTop + newItemHeight;
        updateNewPostCount(1);
        const observer = createObserver(
          (item, obs) => {
            updateNewPostCount(-1);
            setTimeout(() => {
              item.classList.remove("unread");
              obs.unobserve(item);
            }, 1000);
          },
          (item) => {
            // console.log(`Post ${item.dataset.id} is NOT visible — play sound!`);
            audio.manager.playSample("PostAlert");
          }
        );

        observer.observe(card);
      }
    }
  });
}

export function createNewPost(e) {
  e.preventDefault();
  const title = document.getElementById("post-title").value.trim();
  const content = document.getElementById("post-content").value.trim();

  document.querySelectorAll(".error-message").forEach(msg => msg.style.display = "none");
  let hasErrors = false;
  if (!title) { document.getElementById("title-error").style.display = "block"; hasErrors = true; }
  if (!content) { document.getElementById("content-error").style.display = "block"; hasErrors = true; }
  if (hasErrors) return;
  const joinedCategories = globalState.categories.selectedOnPost.map(String);

  fetchJwt("/new_post", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: title,
      body: content,
      categories: joinedCategories,
    }),
  })
    .then(() => {
      document.getElementById("post-title").value = "";
      document.getElementById("post-content").value = "";

      showAlert("Post created successfully!", "PostAlert", 3000)
      showPage("home");
      
    })
    .catch(() => {
      showAlert("Something went wrong, please try again later", undefined, 3000, 'red')
    });
  globalState.categories.selectedOnPost = [];
}

export function prependPost(item) {
  const postId = item.id;
  globalState.postsFeed.byId[postId] = item;
  console.log(globalState.postsFeed.byId[postId])
  if (!globalState.postsFeed.allIds.includes(postId)) {
    globalState.postsFeed.allIds.unshift(postId);
    console.log("added to allIds")
  }

 
  renderPosts([postId], false, "home-page", "postsFeed");
  if (item.creator.id === globalState.user.id) {
    console.log("same user, scroll to top")
    requestAnimationFrame(() => {
  const homeContainer = document.getElementById("home-page");
  if (homeContainer) homeContainer.scrollTop = 0;
});
  }
}

export async function fetchMore(div, range, entityType = "postsFeed") {

  if (!globalState[entityType].fetchMore) return;

  const categories = globalState.categories.selected || [];
  const categoriesParam = categories.length > 0 ? categories.join(',') : '0';
  const lastId = globalState[entityType].allIds[globalState[entityType].allIds.length - 1]

  try {
    const res = await fetchJwt(
      `/posts?last_id=${lastId ?? 0}&range=${range}&categories=${categoriesParam}`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );
    const data = await res.json();

    const posts = data.posts || [];

    if (posts.length === 0) {
      showAlert("No Posts", undefined, 3000);
      return;
    }

    const newIds = updateGlobalState(entityType, data.posts, item => item.id);
    globalState[entityType].fetchMore = data.have_more_posts;
    renderPosts(newIds, true, div.id, entityType)
  } catch (err) {
    console.log(err)
    showAlert("No Posts", undefined, 3000, 'red');
    return;
  }

  console.log("Filtered Posts After Fetch", globalState.filteredPostsFeed.byId)

}

export async function filterByCategories(range = 10) {
  const filteredPage = document.getElementById("filtered-posts-page");
  filteredPage.innerHTML = "";

  //reset filteredPostsFeed before fetching new
  globalState.filteredPostsFeed.fetchMore = true;
  for (const key in globalState.filteredPostsFeed.byId) {
    delete globalState.filteredPostsFeed.byId[key];
  }
  globalState.filteredPostsFeed.allIds.length = 0;
  fetchMore(filteredPage, range, "filteredPostsFeed")
}

export async function unsubscribeFromFiltered() {
  const IdsOnlyInFiltered = globalState.filteredPostsFeed.allIds
    .filter(item => !globalState.postsFeed.allIds.includes(item));

  if (IdsOnlyInFiltered.length > 0) {
    handleSub(IdsOnlyInFiltered, "su", false);
  }
  globalState.filteredPostsFeed.allIds = [];
  globalState.filteredPostsFeed.byId = {};
  globalState.filteredPostsFeed.fetchMore = true;
}

export function updatePost(message) {
  const { id } = message;
  const post = globalState.postsFeed.byId[id];

  if (!post) return;

  const keys = ['reaction_count', 'current_user_reactions', 'comment_count'];

  // Update state
  assignIfExists(post, message, keys);

  // If post is open as single post, update this too
  if (globalState.singlePost?.id === id) {
    globalState.singlePost = post;
  }
  // If post is in filtered feed, update this too
  if (globalState.filteredPostsFeed?.allIds.includes(id)) {
    globalState.filteredPostsFeed.byId[id] = post;
  }


  // Update DOM (for both feed cards and single post, if it exists)
  const cards = document.querySelectorAll(`.post-card[data-id="${id}"]`);
  if (!cards.length) return;

  cards.forEach(card => {
    // Update comment count
    const commentEl = card.querySelector(".comments-count");
    if (commentEl) {
      commentEl.textContent = `💬 ${post.comment_count}`;
    }

    //delete previous reactions and repopulate
    const actionsContainer = card.querySelector(".post-actions");
    if (!actionsContainer) return;
    actionsContainer.querySelectorAll('.reaction').forEach(el => el.remove());

    // Update reactions
    setupReactions(card, id, post, post.current_user_reactions);

  });
}

