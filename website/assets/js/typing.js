import { fetchJwt } from "./jwt_fetch.js"
import { globalState } from './script.js'

let typingInterval = null;
let lastTypedAt = 0;

let typingTimeout = null;

export function setupTypingIndicator() {
  const input = document.getElementById("message-text");

  input.addEventListener("input", () => {
    lastTypedAt = Date.now();

    // Send the first typing event immediately
    if (!typingInterval) {
      sendTypingEvent(); // Send immediately on first input

      // Start interval for subsequent typing events every 2 seconds
      typingInterval = setInterval(async () => {
        const oc = globalState.openConversation;
        if (!oc || !oc.user) return;

        // If user hasn't typed for 2 seconds, stop
        if (Date.now() - lastTypedAt > 2000) {
          clearInterval(typingInterval);
          typingInterval = null;
          return;
        }

        // Send typing event
        sendTypingEvent();
      }, 2000);
    }
  });
  
  // Helper function to send the typing event
  async function sendTypingEvent() {
    try {
      const oc = globalState.openConversation;
      if (!oc || !oc.user) return;

      await fetchJwt("/typing", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ recipient_id: oc.user.id })
      });
    } catch (err) {
      console.warn("Failed to send typing event", err);
    }
  }
}

export function handleTypingEvent(message) {
  const indicator = document.querySelector(".typing-indicator");
  if (!indicator) return;

  if (message.sender_id !== globalState.openConversation?.user?.id) return
  // Show typing
  indicator.textContent = `${globalState.openConversation.user.username} is typing`;
  indicator.classList.add("active");

  // Reset timeout
  if (typingTimeout) clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    indicator.textContent = "";
    indicator.classList.remove("active");
  }, 3000);
}

// Call this whenever a new DM arrives
export function stopTypingIndicator() {
  const indicator = document.querySelector(".typing-indicator");
  if (!indicator) return;

 console.log("STOP TYPING INDICATOR")
  if (typingTimeout) clearTimeout(typingTimeout);
  indicator.textContent = "";
  indicator.classList.remove("active");
}
