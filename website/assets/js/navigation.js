import { onHomePageLoad } from "./script.js";
import { clearErrors } from "./auth.js";
import { audio } from "./audio.js";
import { showAlert } from "./utils.js";
import { handleSub } from "./websocket.js";
import { globalState } from "./script.js"
import { unhighlightAllUsers } from "./users_feed.js";

export let currentPage = "home";
let homeLoaded = false;

export function resetHomeLoaded() {
    return homeLoaded = false;
}

export function showLogin() {
    document.getElementById("registration-page").style.display = "none";
    document.getElementById("app-container").style.display = "none";
    document.getElementById("signin-page").style.display = "flex";
    document.getElementById("signin-form").reset();
}

export function showRegistration() {
    document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
    document.getElementById("signin-page").style.display = "none";
    const form = document.getElementById("registration-form");
    clearErrors(form);
    document.getElementById("registration-page").style.display = "flex";
}

export async function showPage(pageName) {
    if (pageName !== "dm") unhighlightAllUsers();
    // Update nav
    document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
    document.querySelector(`.nav-item[data-page="${pageName}"]`)?.classList.add("active");

    // Hide all pages
    document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));

    // WEBSOCKET: Close all other websockets
    // home subscriptions (online status and post updates) don't close on navigation
    // dm and single post subs can be removed safely every time

    if (
        globalState.openConversation &&
        Object.keys(globalState.openConversation).length !== 0 &&
        globalState.openConversation.user &&
        globalState.openConversation.user.username
    ) {

        handleSub([globalState.openConversation.user.id], "dm:", false)
        handleSub(globalState.openDms.allIds, "su:", false)
    }

    if (Object.keys(globalState.singlePost).length !== 0) {
        handleSub([globalState.singlePost.id], "nc:", false)
        handleSub(globalState.singlePostComments.allIds, "su:", false)
    }

    const pageMap = {
        home: "home-page",
        "new-post": "new-post-page",
        dm: "dm-page",
        post: "single-post-page"
    };

    const pageElement = document.getElementById(pageMap[pageName]);
    if (pageElement) pageElement.classList.add("active");

    currentPage = pageName;


    // Load home data once
    if (pageName === "home" && !homeLoaded) {
        homeLoaded = true;
        await onHomePageLoad();
    }
}

