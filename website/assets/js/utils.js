import { audio } from "./audio.js";
import { globalState,getInitialState } from "./script.js"
import { showLogin, resetHomeLoaded } from "./navigation.js";

export function showAlert(msg, alertSound, duration = 3000, color = '#333') {
  if (alertSound) audio.manager.playSample(alertSound);
  if (color === 'red') color = '#e42a2aff'

  const alertBox = document.createElement('div');
  alertBox.textContent = msg;

  Object.assign(alertBox.style, {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'white',
    color: color,
    padding: '10px 20px',
    borderRadius: '15px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    zIndex: 10000,
    opacity: 1,
    transition: 'opacity 1s'
  });


  document.body.appendChild(alertBox);

  setTimeout(() => {
    alertBox.style.opacity = '0';
    setTimeout(() => {
      alertBox.remove();
    }, 1000);
  }, duration);
}

export function createObserver(onEnter, onExit) {
  return new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      const id = entry.target.dataset.id;
      if (entry.isIntersecting) {
        if (onEnter) {
          onEnter(entry.target, observer);
        }
      } else {
        if (onExit) {
          onExit(entry.target);
        }
      }
    });
  }, {
    threshold: 0.5
  });
}

export function throttle(fn, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}

export function throttleTrailing(fn, delay) {
  let timeout = null;
  let latestArgs = null;
  let latestContext = null;

  return function (...args) {
    latestArgs = args;
    latestContext = this;

    if (!timeout) {
      timeout = setTimeout(() => {
        fn.apply(latestContext, latestArgs);
        timeout = null;
        latestArgs = null;
        latestContext = null;
      }, delay);
    }
  };
}


export function updateNewPostCount(increment) {
  const badge = document.getElementById("new-post-count");
  let current = parseInt(badge.textContent || "0", 10);

  if (current === 0 && increment < 0) return
  current += increment;
  badge.textContent = current;

  if (current === 0) {
    badge.style.display = "none";
  } else {
    badge.style.display = "inline-block";
  }
}

export async function updateUserNotificationCount(userId, increment) {
  console.log("updateUserNotificationCount", userId, increment)
  const badge = document.querySelector(`.notification-badge[data-user-id="${userId}"]`);
  if (!badge) {
    console.log("User badge not found")
    return; // User badge not found
  }

  let current = parseInt(badge.textContent || "0", 10);

  if (current === 0 && increment < 0) return;

  current += increment;
  badge.textContent = current;

  // Show or hide badge based on count
  if (current <= 0) {
    badge.style.display = "none";
  } else {
    badge.style.display = "inline-block";
  }
}

export function getLast(arr) {
  if (!Array.isArray(arr)) return undefined;
  if (arr.length === 0) return 0;
  return arr[arr.length - 1];
}


export function updateGlobalState(entityType, items, idSelector = item => item.id, prepend = false) {
  const newIds = [];

  // Ensure the slice exists
  if (!globalState[entityType]) {
    globalState[entityType] = { byId: {}, allIds: [] };
  }

  items.forEach(item => {
    const entityId = idSelector(item);
    globalState[entityType].byId[entityId] = item;
    if (globalState[entityType].allIds.includes(entityId)) return;
    newIds.push(entityId);
  });

  if (prepend) {
    globalState[entityType].allIds = [...newIds, ...globalState[entityType].allIds];
  } else {
    globalState[entityType].allIds.push(...newIds);
  }

  return newIds;
}

export function getItemId(div, last = true) {
  if (!div) return null;

  const child = last ? div.lastElementChild : div.firstElementChild;
  if (!child) return null;

  return child.dataset.id || null;
}

export function findEntityType(id) {
console.log(globalState.singlePostComments.allIds)
  if (globalState.postsFeed.allIds.includes(id)) return "post"
  if (globalState.singlePostComments.allIds.includes(id)) return "comment"
  if (globalState.openDms.allIds.includes(id)) return "dm"


}

// for status updates, only updates the object if the key exists in message
export function assignIfExists(target, source, keys) {
  for (const key of keys) {
    if (key in source && source[key] !== null) {
      target[key] = source[key];
    }

    else if (key === "current_user_reactions" && !(key in target)) {
      target[key] = []; // safe default
    }
  }
}

export function formatDate(isoString) {
  const date = new Date(isoString);

  // Format manually (day/month/year hours:minutes)
  const day = date.getDate();
  const month = date.getMonth(); // 0-indexed, so August = 7
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  const formatted = `${day}/${month}/${year} ${hours}:${minutes}`;
  return formatted;
}

export function resetGlobalState() {
  const freshState = getInitialState();
  
  // Clear all properties and reassign from fresh state
  Object.keys(globalState).forEach(key => {
    delete globalState[key];
  });
  Object.assign(globalState, freshState);
  
  resetHomeLoaded();

  // Clear sensitive DOM content
  document.querySelector("#home-page")?.replaceChildren();
  document.querySelector("#filtered-posts-page")?.replaceChildren();
  document.querySelector("#single-post-content-area")?.replaceChildren();
  document.querySelector("#comments-display-area")?.replaceChildren();
  document.querySelector(".dm-container")?.replaceChildren();
  document.querySelector(".categories")?.replaceChildren();
  document.querySelector(".users-list")?.replaceChildren();
  document.querySelector("#categories-selection-on-new-post")?.replaceChildren();

  // reset forms
  document.getElementById("new-post-form")?.reset();
  document.getElementById("registration-form")?.reset();
  document.getElementById("signin-form")?.reset();
  const commentInput = document.getElementById("comment-input");
  if (commentInput) commentInput.value = "";

  // reset header info
  const userProfile = document.querySelector(".user-profile span");
  if (userProfile) userProfile.textContent = "";
  const avatar = document.querySelector(".user-profile .avatar");
  if (avatar) avatar.style.backgroundImage = "";

  // reset badge
  const badge = document.querySelector("#new-post-count");
  if (badge) {
    badge.textContent = "0";
    badge.style.display = "none";
  }

  showLogin();
  
  console.log("Global state after reset:", globalState);
}