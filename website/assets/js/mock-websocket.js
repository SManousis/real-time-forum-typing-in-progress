import { createObserver } from "./utils.js";
import { audio } from "./audio.js"
import { renderPosts, prependPost } from './posts.js'
import { appendComment } from './singlepost.js'
import { globalState } from "./script.js"
import {handleWebSocketMessage} from './websocket.js'


// -------------------- Mock WebSocket --------------------
export function startMockWebSocket() {
  setInterval(() => {
    const events = [
      {
        type: "new_post",
        payload: {
          id: Date.now(),
          creator: { id: 999, username: "MockUser", avatar: "M" },
          created_at: new Date().toLocaleString(),
          title: "🔥 Live new post!",
          body: "This post just appeared via WebSocket mock.",
          comment_count: 0,
          categories: [{ "id": 2, "name": "Tech" }]
        },
      },
      {
        type: "new_dm_count",
        payload: {
          "user":
            { "id": 251, "username": "Mitsos", "avatar": "M", "status": "online", },
          "conversation_details":
            { "id": 616, "unread_count": 1, "last_read_message_id": 2005 }
        },
      },
      {
        type: "status_update", //post full
        payload: {
          "id":5,
          "reaction_count": { "❤️": 600, "😂": 3, "😮": 1 },
          "current_user_reactions": ["❤️", "😂"],
          "comment_count": 6000,
        },
      },
      {
        type: "status_update", //post full
        payload: {
          "id":5,
          "comment_count": 999,
        },
      },
      {
        type: "status_update", //post partial
        payload: {
          "id":6,
         "reaction_count": { "❤️": 666, "😂": 3, "😮": 1 },
        },
      },
      {
        type: "status_update", //post partial
        payload: {
          "id":6,
          "comment_count": 666,
        },
      },
        {
        type: "status_update", //post partial
        payload: {
          "id":6,
         "reaction_count": { "❤️": 666, "😂": 2, "😮": 1, "🐦‍⬛":1 },
        },
      },
        {
        type: "status_update", //post partial
        payload: {
          "id":6,
         "reaction_count": { "❤️": 666, "😂": 2, "😮": 3 },
         "current_user_reactions": [ "😮"],
        },
      },
      
            {
        type: "user_update",
        payload: { id: 52, status: "offline" }
      },
    ];

    const msg = events[Math.floor(Math.random() * events.length)];
    handleWebSocketMessage(msg);
  }, 5000);
}

export function startMockWebSocketSinglePost() {
  setInterval(() => {
    const events = [
      
      {
        type: "status_update", //comment full
        payload: {"id": 10,
          "reaction_count": { "😂": 100, "❤️": 6 },
          "current_user_reactions": ["😂"],
      },
    },
     {
        type: "status_update", //comment partial
        payload: {"id": 10,
          "reaction_count": { "😂": 100, "❤️": 6 ,"🫠":1},
      },
    },
    {
        type: "status_update", //comment partial
        payload: {"id": 10,
         "current_user_reactions": [],
      },
    },
          {
        type: "new_comment",
        payload:         {
          "id": 13,
          "parent_id": 5,
          "body": "Have I told you about the multiverse?",
          "creator": {
            "id": 52,
            "username": "smanousi",
            "avatar": "S",
            "status": "online",
          },
          "created_at": "20/8/2025 19:50",

        }
      },
    ];

    const msg = events[Math.floor(Math.random() * events.length)];
    handleWebSocketMessage(msg);
  }, 5000);
}


export function startMockWebSocketConversation() {
  setInterval(() => {
    const events = [
      
               {
        type: "new_dm",
        payload:              {
        "id": 215,
        "conversation_id": 15,
        "creator": { "id": 50, "username": "vstefano", "avatar": "S", "status": "online" },
        "body": "Incoming message",
        "created_at": "4/9/2025 20:00",
        "delivered": true,
        "seen": true,
      

        }
      },

      {
        type: "status_update", //dm full
        payload:         {
          "id": 207,
      "reaction_count": { "⭐": 1 },
          "current_user_reactions": ["⭐"],
        },
      },
            {
        type: "status_update", //dm partial
        payload:         {
          "id": 207,
      "reaction_count": { "⭐": 1,"🎹":1 },
        },
      },
            {
        type: "status_update", //dm partial
        payload:         {
          "id": 207,
          "current_user_reactions": [],
        },
      },
      {
        type: "typing",
        payload:         {
          "sender_id": 50,
        },
      }
    ];

    const msg = events[Math.floor(Math.random() * events.length)];
    handleWebSocketMessage(msg);
  }, 5000);
}
