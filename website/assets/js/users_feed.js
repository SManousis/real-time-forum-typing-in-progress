import { fetchBootstrapData } from "./mock-api-calls.js";
import { globalState } from "./script.js"
import * as conversation from "./conversation.js"
import { fetchJwt } from "./jwt_fetch.js"
import { getItemId } from "./utils.js";
import { showAlert, updateGlobalState, getLast } from "./utils.js";
import { handleSub } from "./websocket.js";


export async function loadUsers() {
    const range = 15;
    globalState.usersFeed.byId = {};
    globalState.usersFeed.allIds = [];
    globalState.usersFeed.fetchMore = true;
    await fetchMore(range);
}

function createUserItem(item, needSub = true) {

    const div = document.createElement("div");
    div.className = "user-item";
    div.dataset.id = item.user.id;
    div.innerHTML = `
    <div class="user-avatar">
      <div style="width: 100%; height: 100%; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; background: linear-gradient(45deg, #667eea, #764ba2);">
        ${item.user.avatar}
      </div>
      <div class="online-status ${item.user.status === 'online' ? 'online' : 'offline'}"></div>
    </div>
    <span>${item.user.username}</span>
    ${item.conversation_details.unread_count != 0 ? `<div class="notification-badge" data-user-id="${item.user.id}">${item.conversation_details.unread_count}</div>` : ""}
  `;


    // WEBSOCKET: Add sub for online status for each user if needSub
    if (needSub) handleSub([item.user.id], "os:")

    return div;
}

export async function renderUsers(newIDs) {

    const container = document.querySelector(".users-list");
    if (!Array.isArray(newIDs) || newIDs.length === 0 || !container) return;

    newIDs.forEach(userId => {
        const feed = globalState.usersFeed.byId[userId];
        if (!feed) return;
        const node = createUserItem(feed);


        addEventListener(node, userId)

        if (node) container.appendChild(node);
    });
}

function addEventListener(element, userId) {
    element.addEventListener("click", (e) => {
        unhighlightAllUsers();
        element.classList.add("selected");
        globalState.openConversation = globalState.usersFeed.byId[userId]
        conversation.loadConversation();
    });
    return element
}

export async function unhighlightAllUsers() {
    document.querySelectorAll(".user-item").forEach(el => {
        el.classList.remove("selected");
    });
}

export function elevateUser(item, onConversation = false) {
 const container = document.querySelector(".users-list");
  if (!container) return;

  const userId = item.user.id;
  const previousScrollTop = container.scrollTop;

  updateFirstAlpha(userId);

  let existingItem = container.querySelector(`[data-id="${userId}"]`);

if (!existingItem){
        // New user
    addUser(item); 
    return;
}

  // Update global state
  globalState.usersFeed.byId[userId] = item;
  const index = globalState.usersFeed.allIds.indexOf(userId);
  if (index > -1) globalState.usersFeed.allIds.splice(index, 1);
  globalState.usersFeed.allIds.unshift(userId);


    // --- Update DOM content in place ---
 // Online status indicator
  const statusEl = existingItem.querySelector(".online-status");
  if (statusEl) {
    statusEl.classList.remove("online", "offline");
    statusEl.classList.add(item.user.status === "online" ? "online" : "offline");
  }

  // Notification badge
  let badge = existingItem.querySelector(".notification-badge");
  const unread = item.conversation_details?.unread_count || 0;
  if (!badge) {
    // if it doesn't exist, create one
    badge = document.createElement("div");
    badge.className = "notification-badge";
    badge.dataset.userId = userId;
    existingItem.appendChild(badge);
  }
  if (unread > 0) {
    badge.textContent = unread;
    badge.style.display = "";
  } else {
    badge.textContent = "";
    badge.style.display = "none";
  }

    // --- Move to top ---
  container.insertBefore(existingItem, container.firstChild);

  // Adjust scroll
requestAnimationFrame(() => {
    const itemOffsetTop = existingItem.offsetTop;
    if (itemOffsetTop < previousScrollTop) {
      container.scrollTop = previousScrollTop + existingItem.offsetHeight;
    } else {
      container.scrollTop = previousScrollTop;
    }

    if (item.user.id === globalState.openConversation?.user?.id && document.getElementById("dm-page").classList.contains("active")) {
      globalState.openConversation = item;
      onConversation = true;
    }

    if (onConversation) {
      existingItem.classList.add("selected");
    }
  });
}


export function updateBadgeCount(item){
    
 const container = document.querySelector(".users-list");
  if (!container) return;

  const userId = item.user.id;
 


  let existingItem = container.querySelector(`[data-id="${userId}"]`);

if (!existingItem){
    return;
}

    // --- Update DOM content in place ---
 // Online status indicator
  const statusEl = existingItem.querySelector(".online-status");
  if (statusEl) {
    statusEl.classList.remove("online", "offline");
    statusEl.classList.add(item.user.status === "online" ? "online" : "offline");
  }

  // Notification badge
  let badge = existingItem.querySelector(".notification-badge");
  const unread = item.conversation_details?.unread_count || 0;
  if (!badge) {
    // if it doesn't exist, create one
    badge = document.createElement("div");
    badge.className = "notification-badge";
    badge.dataset.userId = userId;
    existingItem.appendChild(badge);
  }
  if (unread > 0) {
    badge.textContent = unread;
    badge.style.display = "";
  } else {
    badge.textContent = "";
    badge.style.display = "none";
  }



}



export async function fetchMore(range) {
    if (!globalState.usersFeed.fetchMore) return 0;

    try {
        const res = await fetchJwt(
            `/users_feed?last_id=${globalState.usersFeed.lastFetchedId ?? 0}&range=${range}`,
            { method: "GET", headers: { "Content-Type": "application/json" } }
        )
        const data = await res.json();
        const freshUsers = data.users_feed.filter(
            (item) => !globalState.usersFeed.allIds.includes(item.user.id)
        );
        console.log(globalState.usersFeed.allIds)
        const newIds = updateGlobalState("usersFeed", freshUsers, item => item.user.id)
        console.log(newIds)
        globalState.usersFeed.fetchMore = data.have_more_users;
        globalState.usersFeed.lastFetchedId = getLast(newIds);
        findFirstAlpha(newIds)
        renderUsers(newIds)
        return newIds.length;
    } catch (err) {
        showAlert("failed to fetch users", undefined, 3000, 'red')
        return 0;
    }
}

function findFirstAlpha(newIds) {
    if (globalState.usersFeed.firstAlphaId !== null) return;
    console.log(globalState.usersFeed.byId[4])
    for (const id of newIds) {
        if (globalState.usersFeed.byId[id].conversation_details.id === 0) {
            console.log("HERE");
            globalState.usersFeed.firstAlphaId = id;
            break;
        }
    };
    console.log("USER found", globalState.usersFeed.firstAlphaId);
}

function updateFirstAlpha(id) {
    if (globalState.usersFeed.firstAlphaId === id) {

        const index = globalState.usersFeed.allIds.indexOf(id);
        if (globalState.usersFeed.allIds.length > index + 1) {
            globalState.usersFeed.firstAlphaId = globalState.usersFeed.allIds[index + 1]
        } else {
            globalState.usersFeed.firstAlphaId = null;
        }
    }
    console.log("NEW USER FOUND", globalState.usersFeed.firstAlphaId);
}

export function updateUserStatus(message) {
    const { id, status } = message;

    if (globalState.usersFeed.allIds.includes(id) === false) return;

    // Update state
    globalState.usersFeed.byId[id].status = status

    const statusEl = document.querySelector(`.user-item[data-id="${id}"] .user-avatar .online-status`);
    if (!statusEl) {
        console.log("no statusEl");
        return;
    }

    statusEl.classList.remove("online", "offline");
    statusEl.classList.add(status === "online" ? "online" : "offline");
}


export function addUser(item) {

    const lastId = globalState.usersFeed.allIds.at(-1);
    const lastUser = globalState.usersFeed.byId[lastId];

    const lastUsername = lastUser.user.username;

    const newUsername = item.user.username;

    //check if new user has conversation, and if so add them to the top
    if (item.conversation_details.id !== 0) {
        updateGlobalState("usersFeed", [item], i => i.user.id, true);

        const node = createUserItem(item);
        addEventListener(node, item.user.id);
        if (!node) return;

        const container = document.querySelector(".users-list");

        // Insert the node at the beginning of the container
        container.prepend(node);
        return;
    }


    //check if new user fits in alphabetical order between firstAlpha and last index of allIDs
    if (globalState.usersFeed.firstAlphaId === null || lastUsername.localeCompare(newUsername, undefined, { sensitivity: "base" }) < 0) {
        globalState.usersFeed.fetchMore = true;
        return;
    }

    const startIndex = globalState.usersFeed.allIds.indexOf(globalState.usersFeed.firstAlphaId);
    let insertIndex = globalState.usersFeed.allIds.length; // default = at the end
    for (let i = startIndex; i < globalState.usersFeed.allIds.length; i++) {
        // const currentUsername = globalState.usersFeed.byId[globalState.usersFeed.allIds[i]].username;
        const currentUsername = globalState.usersFeed.byId[globalState.usersFeed.allIds[i]].user.username;


        if (
            newUsername.localeCompare(currentUsername, undefined, {
                sensitivity: "base"
            }) < 0
        ) {
            insertIndex = i;
            break;
        }
    }

    // Insert at found index
    globalState.usersFeed.allIds.splice(insertIndex, 0, item.user.id);
    globalState.usersFeed.byId[item.user.id] = item;

    //find correct position to insert in dom
    const feed = globalState.usersFeed.byId[item.user.id];
    if (!feed) return;

    const node = createUserItem(feed);
    addEventListener(node, item.user.id);
    if (!node) return;

    // Find this user's position in the sorted allIds array
    const index = globalState.usersFeed.allIds.indexOf(item.user.id);
    const container = document.querySelector(".users-list");

    // Insert before the next user's node
    const nextId = globalState.usersFeed.allIds[index + 1];
    const nextNode = container.querySelector(`[data-id="${nextId}"]`);

    if (nextNode) {
        container.insertBefore(node, nextNode);
    }
}


