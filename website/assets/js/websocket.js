import { prependPost, updatePost } from './posts.js'
import { elevateUser, updateUserStatus, addUser, updateBadgeCount } from "./users_feed.js";
import { updateComment, appendComment } from './singlepost.js';
import { updateDm, addDm } from './conversation.js';
import { handleTypingEvent } from './typing.js';
import { findEntityType, resetGlobalState } from './utils.js';

export let currentWebSocket = undefined
let readyPromise

export function clearCurrentWebSocket() {
    currentWebSocket = undefined;
}

//Begin websocket
export async function connectWebSocket(url) {
    console.log("WEBSOCKET")

    //If there's an old websocket, close it
    if (currentWebSocket != undefined) {
        currentWebSocket.close()
        clearCurrentWebSocket();
    }

    //making a promise so that it is used when sending data to new websocket, cause it needs a little time before it connects
    let resolve, reject;
    readyPromise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });

    currentWebSocket = new WebSocket(`wss://${url}`);

    //when connection begins
    currentWebSocket.onopen = () => {
        console.log("Connected");
        resolve("ws connected");
    };

    // when message arrives from server
    currentWebSocket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (Array.isArray(data)) {
                data.forEach((msg) => {
                    handleWebSocketMessage(msg);
                });
            } else {
                handleWebSocketMessage(data);
            }
        } catch (err) {
            console.error("WebSocket message parse failed:", event.data, err);
        }

    }

    // when connection closes
    currentWebSocket.onclose = () => {
        console.log("Disconnected")

        //TODO retry system here
    }

    // when connection errors
    currentWebSocket.onerror = (err) => {
        console.error("WebSocket error:", err)
        resetGlobalState();
        reject(err)

        //TODO retry system here
    }

    return currentWebSocket
}


//Send data to the current websocket
export async function sendToWebSocket(data) {
    try {
        //wait for promise to resolve, we're waiting for websocket to fully connect
        await readyPromise

        currentWebSocket.send(data)
    } catch (err) {
        // console.log("Failed to send data: ", err)    
    }
}

export function handleSub(contentIds, subType, add = true) {

    const prefix = add ? '+' : '-';
    contentIds.forEach(id => {
        const message = `${prefix}${subType}${id}`;
        sendToWebSocket(message);
        console.log("sent sub message: ", message);
    });
}


export function handleWebSocketMessage(message) {
    console.log("WS IN: ", message)
    switch (message.type) {
        //========= always open ==================
        case "new_post":
            console.log("new post!")
            prependPost(message.payload);
            break;
        case "new_dm_count":
            elevateUser(message.payload);
            console.log("new unread dm!")
            break;
        case "marked_seen":
            updateBadgeCount(message.payload);
            console.log("marked seen!")
            break;
        case "owned_update":
            //showAlert with notification that owned post/comment got reaction or comment
            break;
        //========= subscriptions ==================
        //          == general ==
        case "status_update":
            //check whether id is a post, comment or dm
            const entity = findEntityType(message.payload.id)
            switch (entity) {
                case "post":
                    updatePost(message.payload)
                    console.log("post updated!")
                    break;
                case "comment":
                    updateComment(message.payload)
                    console.log("comment updated!")
                    break;
                case "dm":
                    updateDm(message.payload);
                    console.log("updated dm!")
                    break;
            }
            break;
        case "user_update":
            updateUserStatus(message.payload);
            console.log("online status change!")
            break;
        //          == single post ==
        case "new_comment":
            console.log("new comment received!")
            appendComment(message.payload);
            console.log("new comment!")
            break;
        //          == conversation ==  
        case "new_dm":
            setTimeout(() => {
                addDm(message.payload)
            }, 200);
            console.log("new dm!")
            break;
        case "typing":
            handleTypingEvent(message.payload);
            break;
        case "new_user":
            addUser(message.payload);
            break;
        case "excessive_connections":
            alert("Excessive connections detected. Close other tabs or windows using this app.");
            resetGlobalState();
            break;

    }
}

