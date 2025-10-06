import { globalState } from "./script.js"
import { showPage } from "./navigation.js";
import { fetchMessages, fetchNewerMessages, fetchOlderMessages, newDm } from "./mock-api-calls.js"
import { showAlert, updateGlobalState, createObserver, throttle, throttleTrailing, updateUserNotificationCount, getItemId, assignIfExists, formatDate } from "./utils.js";
import { setupReactions } from './reactions.js'
import { audio } from "./audio.js"
import { createScrollHandler } from "./scroll_fetch.js";
import { fetchJwt } from "./jwt_fetch.js"
import { handleSub } from "./websocket.js";
import { startMockWebSocketConversation } from "./mock-websocket.js";
import { stopTypingIndicator, setupTypingIndicator } from "./typing.js";
import { elevateUser } from "./users_feed.js";



export async function loadConversation() {
  globalState.openDms.byId = {};
  globalState.openDms.allIds = [];

  //only fetch if conversation details actually exist
  if (globalState.openConversation.conversation_details?.id) {
    const oc = globalState.openConversation
    try {
      const res = await fetchJwt(
        `/dm?id=${oc.conversation_details.id}&last_id=${oc.conversation_details.last_read_message_id}&before=9&after=10`,

        { method: "GET", headers: { "Content-Type": "application/json" } }
      )
      const data = await res.json();

      if (!data.messages) throw new Error("No messages returned");
      if (data.have_more_dms_after === undefined) throw new Error("No have_more_dms_after returned");
      if (data.have_more_dms_before === undefined) throw new Error("No have_more_dms_before returned");

      oc.newConv = false;
      globalState.openDms.fetchMoreAfter = data.have_more_dms_after
      globalState.openDms.fetchMoreBefore = data.have_more_dms_before

      console.log(oc.user.id)

      const newIds = updateGlobalState("openDms", data.messages, item => item.id);
      createConversationItem();
      handleSub([oc.user.id], "dm:")
      renderDms(globalState.openDms.allIds, true, false);
      return
    } catch (err) {
      showAlert("failed to fetch converation", undefined, 3000, 'red')
      return;
    }
  } else {
    const oc = globalState.openConversation
    oc.conversation_details = {};
    oc.conversation_details.id = null;
    oc.conversation_details.newConv = true;
  }

  createConversationItem();
}


function createConversationItem() {
  showPage("dm")
  // startMockWebSocketConversation(); //mock websocket

  const oc = globalState.openConversation

  const container = document.getElementsByClassName("dm-container")[0];

  container.innerHTML = `
  <div class="dm-header">
      <div class="avatar"
        style="background: linear-gradient(45deg, #667eea, #764ba2); width: 40px; height: 40px;">
        ${globalState.user.avatar}</div>
      <div class="avatar"
        style="background: linear-gradient(45deg, #43e97b, #38f9d7); width: 40px; height: 40px;">
        ${oc.user.avatar}</div>
      <h3>Direct Messaging with  ${oc.user.username}</h3>
  </div>

  <div id="dm-messages" class="dm-messages"></div>
  

  <div class="typing-indicator"></div>

  <div id="message-input" class="comment-input">
      <input type="text" id="message-text" placeholder="New Message">
      <button id="submit-message" class="send-btn" tabindex="0">
          <img src="assets/img/addcomment.svg" alt="Add Comment">
      </button>
  </div>
  `

  const input = document.getElementById("message-text");
  const button = document.getElementById("submit-message");

  button.addEventListener("click", () => {
    const text = input.value.trim();
    if (text !== "") {
      const success = submitMessage(text);
      if (success) input.value = "";
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // prevent form submit or newline
      button.click();     // trigger the same logic as clicking the button
    }
  });

  setupTypingIndicator();

  const conversationDiv = document.getElementById("dm-messages");
  const { handler, checkPosition } = createScrollHandler({
    fetchDown: () => fetchDown(conversationDiv, 10),
    fetchUp: () => fetchUp(conversationDiv, 10)
  })

  conversationDiv.addEventListener(
    "scroll",
    throttle(handler, 100)
  );

  checkPosition(conversationDiv, { dryRun: true });
}

async function submitMessage(msg) {
  const oc = globalState.openConversation;
  let conversationId = oc.conversation_details.id // send null for api to create new
  let messageId = null;
  // actual
  try {
    const res = await fetchJwt("/new_dm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        receiver_id: oc.user.id,
        body: msg,
        action_id: `new-dm-${conversationId}-${globalState.user.id}`
      })
    });

    const result = await res.json();

    if (result.message_id === undefined) throw new Error("No message id returned");
    if (!result.conversation_id) throw new Error("No conversation id returned");
    if (!result.created_at) throw new Error("No sent at returned");

    if (oc.conversation_details.newConv) {
      handleSub([oc.user.id], "dm:");
      oc.conversation_details.newConv = false;
    }

    messageId = result.message_id;
    oc.conversation_details.id = result.conversation_id
    oc.conversation_details.unread_count = 0;
    oc.conversation_details.last_read_message_id = messageId

    // mark all visible DMs as read up to messageId
    document.querySelectorAll('.message.unread').forEach(msgEl => {
      const dmId = Number(msgEl.dataset.id);
      if (dmId <= messageId) {
        msgEl.classList.remove('unread');
      }
    });

    const message = {
      id: messageId,
      conversation_id: oc.conversation_details.id,
      creator: globalState.user,
      body: msg,
      created_at: result.created_at,
    }

    // Doing this here to ensure message is stored before subscribing to conversation
    updateGlobalState("openDms", [message], item => item.id);
    elevateUser(oc, true);
    renderDms([message.id], false, false, true)
    globalState.openDms.fetchMoreAfter = false;
  } catch (err) {
    showAlert("Failed to send message, try again later", undefined, 2000, "red")
    return false;
  }
  return true;
}

export function addDm(message) {
  if (globalState.openConversation.conversation_details.id !== message.conversation_id) return;
  if (globalState.openDms.allIds.includes(message.id)) {
    console.log("already have dm")
    return;
  }
  updateGlobalState("openDms", [message], item => item.id);

  //render if messages are loaded to the end only
  if (!globalState.openDms.fetchMoreAfter) {
    renderDms([message.id], false, false, true)
  } else {
    showAlert("New Message", "DmAlert")
  }
  audio.manager.playSample("DmAlert");

  stopTypingIndicator();

}



function createMessageItem(item) {
  if (globalState.openConversation.conversation_details.last_read_message_id === null) globalState.openConversation.conversation_details.last_read_message_id = 0;
  // const isNew = item.id > globalState.openConversation.conversation_details.last_read_message_id;
  const isNew = item.id > globalState.openConversation.conversation_details.last_read_message_id && item.sender_id !== globalState.user.id;
  const unreadClass = isNew ? 'unread' : '';
  const card = document.createElement("div");
  card.className = `message ${unreadClass}`;
  card.dataset.id = item.id

  const userReactions = item.current_user_reactions || [];
  console.log(item)
  card.innerHTML = `
  <div class="avatar" style="background: linear-gradient(45deg, #667eea, #764ba2);">${item.creator.avatar}
    </div>
    <div class="message-content">
      <div class="message-author">${item.creator.username} <span class="message-time">${formatDate(item.created_at)} </span></div>
      <div class="message-text">
        ${item.body}
      </div>
    <div class="post-actions">
              <button class="action-btn add-reaction-btn">
        <img src="assets/img/addreaction.svg">
      </button>
    </div>
  </div>
  `;


  // Setup reactions using the generalized function
  setupReactions(card, item.id, item, userReactions);

  // WEBSOCKET subscribe for reactions
  handleSub([item.id], "su:")

  return { card };
}


export async function renderDms(dmIds, initial = false, before = false, scrollDown = false) {
  const dmArea = document.getElementsByClassName("dm-messages")[0];
  if (!dmArea) return;

  let lastReadMessageNode = null;

  if (before) { //dms need to be prepended

    const frag = document.createDocumentFragment();

    dmIds.forEach(dmId => {

      if (!globalState.openDms.byId[dmId]) return
      const dm = globalState.openDms.byId[dmId];
      dm.creator = globalState.openConversation.user.id === dm.sender_id ? globalState.openConversation.user : globalState.user;



      const { card: node } = createMessageItem(dm);
      if (node) frag.appendChild(node)
    });

    //const prevScrollHeight = dmArea.scrollHeight;
    dmArea.insertBefore(frag, dmArea.firstChild);
    //dmArea.scrollTop += dmArea.scrollHeight - prevScrollHeight;

  } else {
    dmIds.forEach(dmId => {
      if (!globalState.openDms.byId[dmId]) return
      const dm = globalState.openDms.byId[dmId];
      dm.creator = globalState.openConversation.user.id === dm.sender_id ? globalState.openConversation.user : globalState.user;
      const { card: node } = createMessageItem(dm);


      if (node) {
        dmArea.appendChild(node);

        //if initial load, save nod of last read
        if (initial && Number(dmId) == Number(globalState.openConversation.conversation_details.last_read_message_id)) {
          lastReadMessageNode = node;
        }
        if (dmId > globalState.openConversation.conversation_details.last_read_message_id) {
          const observer = createObserver(
            (item, obs) => {
              requestAnimationFrame(() => {
                updateUserNotificationCount(globalState.openConversation.user.id, -1); //<--remove  notification for seen dm (NEED TO MAKE FUNCTION)
                throttledMarkRead(dmId, dm.sender_id);
                setTimeout(() => {
                  item.classList.remove("unread");
                  obs.unobserve(item);
                }, 1000);
              })
              // globalState.openConversation.conversation_details.last_read_message_id = dmId
              console.log("Create Observer for DM:", globalState.openDms.byId[dmId])
            }
          );

          observer.observe(node);
        }
      }
    });
  }

  // Perform scroll to new message
  if (scrollDown) {
    dmArea.scrollTop = dmArea.scrollHeight
  } else if (initial && lastReadMessageNode) {
    const offsetTop = lastReadMessageNode.offsetTop;
    // Get the header height 
    const header = document.querySelector(".dm-header");
    const headerHeight = header ? header.offsetHeight : 0;
    dmArea.scrollTop = offsetTop - headerHeight;
  }
}

const throttledMarkRead = throttleTrailing(async (dmId, sender_id) => {
  console.log("sender id", sender_id)

  const lastRead = globalState.openConversation.conversation_details.last_read_message_id;

  // skip if this DM is already considered read
  if (dmId <= lastRead) return;


  globalState.openConversation.conversation_details.last_read_message_id = dmId
  if (sender_id === globalState.user.id) return
  console.log("Marking Seen", globalState.openDms.byId[dmId])
  let res = await fetchJwt("/mark-seen", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ dm_id: dmId, conversation_id: globalState.openConversation.conversation_details.id }),
  });
}, 1000);

export async function fetchDown(div, range = 5) {
  if (!globalState.openDms.fetchMoreAfter) return;
  const lastId = globalState.openDms.allIds[globalState.openDms.allIds.length - 1] ?? 0;
  try {
    const res = await fetchJwt(
      `/dm?id=${globalState.openConversation.conversation_details.id}&last_id=${lastId}&after=${range}&before=0`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );

    const data = await res.json();
    const newIds = updateGlobalState("openDms", data.messages, item => item.id);
    globalState.openDms.fetchMoreAfter = data.have_more_dms_after
    renderDms(newIds, false, false);
  } catch (err) {
    showAlert("failed to fetch new messages", undefined, 3000, 'red');
    return;
  }
}

export async function fetchUp(div, range = 9) {
  if (!globalState.openDms.fetchMoreBefore) return;
  try {
    const res = await fetchJwt(
      `/dm?id=${globalState.openConversation.conversation_details.id}&last_id=${globalState.openDms.allIds[0] ?? 0}&before=${range}&after=0`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );

    const data = await res.json();
    const newIds = updateGlobalState("openDms", data.messages, item => item.id, true);
    globalState.openDms.fetchMoreBefore = data.have_more_dms_before
    renderDms(newIds, false, true);
  } catch (err) {
    showAlert("failed to fetch new messages", undefined, 3000, 'red');
    return;
  }

}

export function updateDm(message) {
  const { id } = message;
  const entity = globalState.openDms.byId[id];

  if (!entity) return;

  const keys = ['reaction_count', 'current_user_reactions'];

  // Update state
  assignIfExists(entity, message, keys);



  // Update DOM
  const card = document.querySelector(`.message[data-id="${id}"]`);
  if (!card) return;

  //delete previous reactions and repopulate
  const actionsContainer = card.querySelector(".post-actions");
  if (!actionsContainer) return;
  actionsContainer.querySelectorAll('.reaction').forEach(el => el.remove());

  setupReactions(card, id, globalState.openDms.byId[id], globalState.openDms.byId[id].current_user_reactions);
}