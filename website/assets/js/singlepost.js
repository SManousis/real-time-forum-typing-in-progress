import { globalState } from "./script.js"
import { showPage } from "./navigation.js"
import { fetchPostById, fetchComments } from "./mock-api-calls.js"
import { setupReactions } from './reactions.js'
import { createPostItem } from "./posts.js"
import { showAlert, createObserver, updateGlobalState, getItemId, assignIfExists, formatDate } from "./utils.js"
import { audio } from "./audio.js"
import { startMockWebSocketSinglePost } from "./mock-websocket.js"
import { handleSub } from "./websocket.js";
import { fetchJwt } from "./jwt_fetch.js"

export async function showPost() {
  // clear existing post and comments before loading the page
  const postContentArea = document.getElementById("single-post-content-area");
  if (!postContentArea) return;
  postContentArea.innerHTML = "";

  const commentsDisplayArea = document.getElementById("comments-display-area");
  if (!commentsDisplayArea) return;
  commentsDisplayArea.innerHTML = "";



  showPage('post');
  loadPost()
  fetchMoreComments(10);

  // startMockWebSocketSinglePost(); //mock websocket

}


export async function loadPost() {
  if (globalState.singlePost.truncated) {
    // const post = await fetchPostById(globalState.singlePost.id); //mock api, maybe websocket better?

    // REAL ==================================
    let post;
    try {
      const res = await fetchJwt(
        `/post?post_id=${globalState.singlePost.id}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      )
      post = await res.json();
    } catch (err) {
      showAlert("failed to fetch post", undefined, 3000, 'red')
      return;
    }

    globalState.singlePost = post;
  }

  // WEBSOCKET: Listen to existing sub
  // WEBSOCKET: New comments on open post nc:id (of post)
  handleSub([globalState.singlePost.id], "nc:")

  renderSinglePost();
}

// DEPRECATED: Call fetchMoreComments
// Mock ===========================
// export async function loadComments() {
//   const data = await fetchComments(globalState.singlePost.id);//mock
//   const commentIds = updateGlobalState("singlePostComments", data.comments, item => item.id);
//   globalState.singlePostComments.fetchMore = data.have_more_comments

//   renderComments(commentIds, true);
// }



export async function renderSinglePost() {
  const postContentArea = document.getElementById("single-post-content-area");

  if (!postContentArea) return;

  postContentArea.innerHTML = ""; // Clear existing content
  const { card: node } = createPostItem(globalState.singlePost, true);
  postContentArea.appendChild(node);
  
  const commentInput = document.getElementById("comment-input")
  commentInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const button = document.getElementById("submit-comment");
      e.preventDefault(); // prevent form submit or newline
      button.click();     // trigger the same logic as clicking the button
    }
  });
}

export async function renderComments(commentIds, initial = false) {


  const container = document.getElementById("comments-display-area")


  commentIds.forEach(commentId => {
    const comment = globalState.singlePostComments.byId[commentId]
    if (!comment) return

    const { div: node } = createCommentItem(comment, initial);

    const scroll = document.getElementById("single-post-scroll")
    const previousScrollTop = scroll.scrollTop;


    if (node) {
      if (initial) {
        container.appendChild(node);
      } else {
        container.appendChild(node);
        showAlert(`${comment.creator.username} just posted a new comment`)
        node.scrollIntoView();
        const observer = createObserver(
          (item, obs) => {
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

        observer.observe(node);
      }
    }
    // WEBSOCKET: Add Sub to comment
    handleSub([commentId], "su:")

  });
}

function createCommentItem(item, initial = false) {

  const div = document.createElement("div");

  const isNew = !initial;
  const unreadClass = isNew ? 'unread' : '';
  div.className = `comment ${unreadClass}`;
  div.dataset.id = item.id;

  const userReactions = item.current_user_reaction || [];


  div.innerHTML = `
      <div class="post-header">
        <div class="avatar">${item.creator.avatar}</div>
        <span class="post-author">${item.creator.username}</span>
        <span class="post-time">${formatDate(item.created_at)}</span>
      </div>
      <div class="post-content">${item.body}</div>
      <div class="post-actions">
        <button class="action-btn add-reaction-btn">
          <img src="assets/img/addreaction.svg">
        </button>
      </div>
    `;

  // Setup reactions using the generalized function
  setupReactions(div, item.id, item, userReactions);

  return { div };
}

export function appendComment(item) {
  console.log("appending comment")
  updateGlobalState("singlePostComments", [item], item => item.id);
  // const commentId = item.id;
  // globalState.singlePostComments.byId[commentId] = item;
  // const index = globalState.singlePostComments.allIds.indexOf(commentId);
  // if (index > -1) globalState.singlePostComments.allIds.push(commentId);
  renderComments([item.id], false)
}

export async function fetchMoreComments(range = 10) {
  if (!globalState.singlePostComments.fetchMore) {
    return;
  }
  let lastCommId = null;
  if (globalState.singlePostComments.allIds.length !== 0) {
    lastCommId = globalState.singlePostComments.allIds[globalState.singlePostComments.allIds.length - 1]
  }
  try {
    const res = await fetchJwt(
      `/comments?parent_id=${globalState.singlePost.id}&last_id=${lastCommId || 0}&range=${range}`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );

    const data = await res.json();
    // TODO: Error handling for response
    const newIds = updateGlobalState("singlePostComments", data.comments, item => item.id);
    globalState.singlePostComments.fetchMore = data.have_more_comments
    renderComments(newIds, true);
  } catch (err) {

    showAlert("failed to fetch older comments", undefined, 3000, 'red');
    return;
  }
}

export async function submitComment() {
  const input = document.getElementById("comment-input");
  const button = document.getElementById("submit-comment");
  const text = input.value.trim();

  if (text !== "") {
    button.disabled = true;

    try {
      const res = await fetchJwt("/new_comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          parent_id: globalState.singlePost.id,
          body: text,
        }),
      });

      const data = await res.json();

      // const comment = {
      //   id: data.id,
      //   parent_id: globalState.singlePost.id,
      //   body: text,
      //   creator: globalState.user,
      //   created_at: data.created_at,
      // };

      // appendComment(comment);
      input.value = "";
    } catch (err) {
      console.log(err);
      showAlert("Something went wrong, please try again later", undefined, 3000, 'red');
    } finally {
      button.disabled = false;
    }
  }
}


export function updateComment(message) {
  const { id } = message;
  const entity = globalState.singlePostComments.byId[id];

  if (!entity) return;

  const keys = ['reaction_count', 'current_user_reactions'];

  // Update state
  assignIfExists(entity, message, keys);

  console.log("Updated Comment:", entity);

  // Update DOM
  const comment = document.querySelector(`.comment[data-id="${id}"]`);
  if (!comment) return;

  console.log("Found Comment Element in DOM");
  if (message.current_user_reactions || message.reaction_count) {
    console.log("Updating reactions in DOM");
    //delete previous reactions and repopulate
    const actionsContainer = comment.querySelector(".post-actions");
    if (!actionsContainer) return;
    actionsContainer.querySelectorAll('.reaction').forEach(el => el.remove());

    setupReactions(comment, id, globalState.singlePostComments.byId[id], globalState.singlePostComments.byId[id].current_user_reactions);
  }

}