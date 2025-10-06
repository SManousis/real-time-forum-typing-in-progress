import { showAlert } from "./utils.js";
import { showEmojiPicker } from './emojipicker.js'
import { fetchJwt } from "./jwt_fetch.js"

export function renderReactions(item, userReactions) {
  return Object.entries(item.reaction_count || {})
    .map(([emoji, count]) => {
      // Check if this emoji is in the user's previous reactions
      const userHasReacted = userReactions.includes(emoji);
      const userClass = userHasReacted ? 'user-reacted' : ''; // Apply the class if the user has reacted

      return `
        <button class="reaction" data-emoji="${emoji}" data-id="${item.id}">
          <span class="emoji ${userClass}">${emoji}</span> ${count}
        </button>`;
    })
    .join('');
}

export function toggleReaction(emoji, itemId, btn) {
  const emojiElement = btn.querySelector('.emoji');

  if (emojiElement) {
    const userHasReacted = emojiElement.classList.contains('user-reacted');

    // Toggle the class
    emojiElement.classList.toggle('user-reacted');

    // Update the count
    const [symbol, number] = btn.textContent.trim().split(' ');
    let count = parseInt(number, 10);
    count = userHasReacted ? count - 1 : count + 1;

    // If count reaches 0, remove the button entirely
    if (count <= 0) {
      btn.remove();
      showAlert(`Removed ${emoji}`, "EmojiAlert", 2000);
      callApi(emoji, itemId, !userHasReacted)
      return;
    }

    // Preserve the span structure with its classes
    const newUserClass = emojiElement.classList.contains('user-reacted') ? 'user-reacted' : '';
    btn.innerHTML = `<span class="emoji ${newUserClass}">${emoji}</span> ${count}`;

    callApi(emoji, itemId, !userHasReacted)

    showAlert(`${userHasReacted ? 'Removed' : 'Reacted with'} ${emoji}`, "EmojiAlert", 2000);
  } else {
    console.error('Emoji element not found inside button:', btn);
  }
}

export function handleEmojiButtonClick(emoji, itemId, btn) {
  toggleReaction(emoji, itemId, btn);
}

// General function to setup reactions for any container (post, comment, dm)
export function setupReactions(container, itemId, item, userReactions) {
  // Render reactions and add to container
  const reactionsHTML = renderReactions(item, userReactions);
  const actionsContainer = container.querySelector('.post-actions');

  // Insert reactions before the add reaction button
  const addReactionBtn = actionsContainer.querySelector('.add-reaction-btn, button img[src$="addreaction.svg"]')?.closest('button');
  if (addReactionBtn && reactionsHTML) {
    addReactionBtn.insertAdjacentHTML('beforebegin', reactionsHTML);
  }

  // Add event listeners to all reaction buttons in this container
  container.querySelectorAll('.reaction').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const emoji = btn.dataset.emoji;
      handleEmojiButtonClick(emoji, itemId, btn);
    });
  });

  // Setup add reaction button
  if (addReactionBtn) {
    handleAddReaction(itemId, addReactionBtn);
  }
}

// General add reaction handler
export function handleAddReaction(itemId, addReactionBtn) {
  // Check if we've already added the listener to prevent duplicates
  if (addReactionBtn.dataset.listenerAdded) return;
  addReactionBtn.dataset.listenerAdded = 'true';

  addReactionBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Find the parent container (could be post-card, comment, dm, etc.)
    const container = addReactionBtn.closest('.post-card, .comment, .message');

    showEmojiPicker(addReactionBtn, (emoji) => {
      console.log(`Emoji "${emoji}" selected for ID ${itemId}`);
      handleEmojiPickerSelection(emoji, itemId, container);
    });
  });
}


// Handle emoji picker selections
function handleEmojiPickerSelection(emoji, itemId, container) {
  // Look for existing reaction button with this emoji
  const existingBtn = container.querySelector(`button.reaction[data-emoji="${emoji}"]`);

  if (existingBtn) {
    // Emoji button already exists - just toggle it
    toggleReaction(emoji, itemId, existingBtn);
  } else {
    // Create new reaction button
    createNewReactionButton(emoji, itemId, container);
  }
}

function createNewReactionButton(emoji, itemId, container) {
  // Find the actions container
  const actionsContainer = container.querySelector('.post-actions');
  const addReactionBtn = actionsContainer.querySelector('.add-reaction-btn, button img[src$="addreaction.svg"]')?.closest('button');

  // Create new reaction button
  const newReactionBtn = document.createElement('button');
  newReactionBtn.className = 'reaction';
  newReactionBtn.dataset.emoji = emoji;
  newReactionBtn.dataset.id = itemId;
  newReactionBtn.innerHTML = `<span class="emoji user-reacted">${emoji}</span> 1`;

  // Insert before the add reaction button
  if (addReactionBtn) {
    actionsContainer.insertBefore(newReactionBtn, addReactionBtn);
  } else {
    actionsContainer.appendChild(newReactionBtn);
  }

  // Add event listener to the new button
  newReactionBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleEmojiButtonClick(emoji, itemId, newReactionBtn);
  });



  callApi(emoji, itemId, true)


  showAlert(`Reacted with ${emoji}`, "EmojiAlert", 2000);
}

function callApi(emoji, itemId, add) {
  console.log("Calling API for reaction:", { emoji, itemId, add });
  fetchJwt("/new_reaction", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      content_id: itemId,
      type: emoji,
      new: add,
    })
  });
}



