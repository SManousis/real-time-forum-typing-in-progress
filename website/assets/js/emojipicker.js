import { toggleReaction } from './reactions.js'
import { showAlert } from "./utils.js";

let emojiList = [];

export async function loadEmojis() {
  if (emojiList.length) return emojiList;
  console.log("LOADING EMOJIS......")
  // const res = await fetch('https://unpkg.com/unicode-emoji-json@latest/data-ordered-emoji.json');
  const res = await fetch('assets/static/emojis.json')
  emojiList = await res.json();
  return emojiList;
}

function removeEmojiPicker() {
  const picker = document.querySelector('.emoji-picker');
  if (picker) {
    picker.remove();
    document.removeEventListener('click', handleOutsideClick);
  }
}

let currentAnchor = null;

function handleOutsideClick(e) {
  const picker = document.querySelector('.emoji-picker');
  if (!picker || picker.contains(e.target) || e.target === currentAnchor) {
    return;
  }
  removeEmojiPicker();
}

export async function showEmojiPicker(anchorElement, onEmojiSelect) {
  removeEmojiPicker(); // close existing one

  const emojis = await loadEmojis();
  const picker = document.createElement('div');
  picker.className = 'emoji-picker';

  picker.style.position = 'absolute';
  picker.style.display = 'grid';
  picker.style.gridTemplateColumns = 'repeat(8, 1fr)';
  picker.style.gap = '4px';
  picker.style.padding = '8px';
  picker.style.background = 'white';
  picker.style.border = '1px solid #ccc';
  picker.style.borderRadius = '8px';
  picker.style.boxShadow = '0 2px 10px rgba(0,0,0,0.15)';
  picker.style.maxHeight = '200px';
  picker.style.overflowY = 'auto';
  picker.style.zIndex = '9999';

  picker.innerHTML = emojis.map(e => `<button class="emoji-btn" style="font-size: 18px; padding: 4px; border: none; background: transparent; cursor: pointer;">${e}</button>`).join('');

  document.body.appendChild(picker);

  const rect = anchorElement.getBoundingClientRect();
  picker.style.top = `${rect.bottom + window.scrollY + 5}px`;
  picker.style.left = `${rect.left + window.scrollX}px`;

  currentAnchor = anchorElement;

  picker.querySelectorAll('.emoji-btn').forEach(btn =>
    btn.addEventListener('click', () => {
      onEmojiSelect(btn.textContent);
      removeEmojiPicker();
    })
  );

  // Important: delay adding outside click handler just slightly
  requestAnimationFrame(() => {
    document.addEventListener('click', handleOutsideClick);
  });
}
