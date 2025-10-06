import { fetchBootstrapData } from "./mock-api-calls.js";
import { startMockWebSocket } from "./mock-websocket.js"
import { handleSignin, handleRegistration, logout } from "./auth.js";
import { showLogin, showPage, showRegistration, currentPage } from "./navigation.js"
import * as users from "./users_feed.js"
import * as posts from "./posts.js"
import * as categories from "./categories.js"
import * as user from "./user.js"
import { audio } from "./audio.js";
import * as utils from "./utils.js"
import { createScrollHandler } from "./scroll_fetch.js"
import * as feed from "./users_feed.js"
import { fetchMoreComments, submitComment } from "./singlepost.js"
import { connectWebSocket } from "./websocket.js";
import { loadEmojis } from "./emojipicker.js";

export const serverAddr = "https://localhost:8081";

// -------------------- Global State --------------------
export function getInitialState() {
  return {
    user: {},
    usersFeed: {
      byId: {},
      allIds: [],
      lastFetchedId: 0,
      fetchMore: true,
      firstAlphaId: null,
    },
    postsFeed: {
      byId: {},
      allIds: [],
      fetchMore: true,
    },
    filteredPostsFeed: {
      byId: {},
      allIds: [],
      fetchMore: true,
    },
    categories: {
      byId: {},
      allIds: [],
      fetchMore: true,
      selected: [],
      selectedOnPost: [],
    },
    openConversation: {},
    openDms: {
      byId: {},
      allIds: [],
      fetchMoreBefore: true,
      fetchMoreAfter: true,
    },
    singlePost: {},
    singlePostComments: {
      byId: {},
      allIds: [],
      fetchMore: true,
    },
    wsSubscriptions: [],
  };
}

export let globalState = getInitialState();

// -------------------- Initialization --------------------
document.addEventListener("DOMContentLoaded", () => {
  // Show signin first
  document.getElementById("signin-page").style.display = "none";
  document.getElementById("registration-page").style.display = "none";
  document.getElementById("app-container").style.display = "none";

  // Event listeners
  document.getElementById("signup-link")?.addEventListener("click", (e) => { e.preventDefault(); showRegistration(); });
  document.getElementById("registration-form").addEventListener("submit", (e) => { e.preventDefault(); handleRegistration(e); });
  document.getElementById("signin-form").addEventListener("submit", (e) => { e.preventDefault(); handleSignin(e); });
  document.getElementById('login-link')?.addEventListener("click", (e) => { e.preventDefault(); showLogin(); });
  document.getElementById("logout-link")?.addEventListener("click", (e) => { e.preventDefault(); logout(); });
  document.getElementById("new-post-form").addEventListener("submit", posts.createNewPost);
  document.getElementById("submit-comment").addEventListener("click", (e) => {
    e.preventDefault();
    submitComment();
  });

  //Mute button
  const toggleBtn = document.getElementById("sound-toggle");
  const iconOn = document.getElementById("sound-icon-on");
  const iconOff = document.getElementById("sound-icon-off");


  if (toggleBtn) {
    toggleBtn.addEventListener("click", async () => {
      initAudio();
      audio.manager.sounds = !audio.manager.sounds;

      if (audio.manager.sounds) {
        iconOn.style.display = "inline";
        iconOff.style.display = "none";
      } else {
        iconOn.style.display = "none";
        iconOff.style.display = "inline";
        audio.manager.killSamples();
      }
    });
  }

  // Nav items
  document.querySelectorAll(".nav-item").forEach((nav) => {
    nav.addEventListener("click", (e) => {
      e.preventDefault();
      showPage(nav.dataset.page);
    });
  });


  // Sidebar category clicks
  document.body.addEventListener("click", (e) => {
    const item = e.target.closest("#categories-container .category-item");
    const filteredPage = document.getElementById("filtered-posts-page");
    const homePage = document.getElementById("home-page");

    if (!item) return;

    if (e.target.classList.contains("category-item")) {
      e.preventDefault();
      const catId = e.target.dataset.id;
      showPage('home')
      if (globalState.categories.selected.includes(catId)) {
        e.target.classList.remove("active");
        let index = globalState.categories.selected.indexOf(catId)
        if (index != -1) {
          globalState.categories.selected.splice(index, 1)
        }
      } else {
        e.target.classList.add("active");
        globalState.categories.selected.push(catId);
      }
    }

    if (globalState.categories.selected.length > 0) {
      posts.filterByCategories();
      homePage.classList.remove("active");
      filteredPage.classList.add("active");
    } else {
      homePage.classList.add("active");
      filteredPage.classList.remove("active");
      filteredPage.innerHTML = "";
      posts.unsubscribeFromFiltered();
      return;
    }
  });

  const seeAllPostsBtn = document.getElementById("see-all-posts");
  seeAllPostsBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const homePage = document.getElementById("home-page");
    const filteredPage = document.getElementById("filtered-posts-page");
    globalState.categories.selected = [];
    document.querySelectorAll("#categories-container .category-item.active")
      .forEach((item) => item.classList.remove("active"));
    filteredPage.classList.remove("active");
    filteredPage.innerHTML = "";
    posts.unsubscribeFromFiltered();
    if (homePage) {
      homePage.classList.add("active");
      homePage.scrollTo({ top: 0, behavior: "smooth" });
    }
  });


  // Toggle password visibility
  document.querySelectorAll(".password-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.previousElementSibling;
      if (input.type === "password") {
        input.type = "text";
        btn.textContent = "hide";
      } else {
        input.type = "password";
        btn.textContent = "show";
      }
    });
  });

  // Hide all error messages
  document.querySelectorAll(".error-message").forEach(msg => msg.style.display = "none");

  // Fetch with scroll items

  const home = document.getElementById("home-page");
  const { handler: homeScroll, checkPosition: homeScrollPos } = createScrollHandler(
    { fetchDown: () => posts.fetchMore(home, 10) }
  );
  home.addEventListener(
    "scroll",
    utils.throttle(homeScroll, 300)
  );
  homeScrollPos(home, { dryRun: true });


  const usersFeed = document.querySelector(".users-list");
  const { handler: usersScroll, checkPosition: usersScrollPos } = createScrollHandler(
    { fetchDown: () => feed.fetchMore(10) }
  );
  usersFeed.addEventListener(
    "scroll",
    utils.throttle(usersScroll, 300)
  );
  usersScrollPos(usersFeed, { dryRun: true })

  const comments = document.getElementById("single-post-scroll")
  const { handler: commentsScroll, checkPosition: commentsScrollPos } = createScrollHandler(
    { fetchDown: () => fetchMoreComments(10) }
  );
  comments.addEventListener(
    "scroll",
    utils.throttle(commentsScroll, 300)
  );
  commentsScrollPos(comments, { dryRun: true })

  const filteredPost = document.getElementById("filtered-posts-page")
  const { handler: filteredPostsScroll, checkPosition: filteredPostsScrollPos } = createScrollHandler(
    { fetchDown: () => posts.fetchMore(filteredPost, 10, "filteredPostsFeed") }
  );
  filteredPost.addEventListener(
    "scroll",
    utils.throttle(filteredPostsScroll, 300)
  );
  filteredPostsScrollPos(comments, { dryRun: true })

  autologin();
});



// -------------------- Home Page Bootstrap --------------------
export async function onHomePageLoad() {
  console.log("full reload")
  users.loadUsers()
  posts.loadPosts();
  categories.fetchCategories();
  loadEmojis();

  // WEBSOCKET: Start
  // startMockWebSocket(); //mock
  let ws = await connectWebSocket("localhost:8081/ws") //actual
}

async function autologin() {
  try {
    await user.loadUser()
  } catch (err) {
    document.getElementById("signin-page").style.display = "flex";
    console.error("Auto-login failed, resetting", err);
    utils.resetGlobalState();
    return err;
  }
  document.getElementById("app-container").style.display = "block";
  showPage("home");
  utils.showAlert(`Welcome back!`, "DmAlert");
}

export async function initAudio() {
  if (!audio.initialized) {
    audio.setUp()
      .then(() => {
        audio.initialized = true;
      })
      .catch(audioErr => {
        console.error("Audio setup failed:", audioErr);
      });
  }
}