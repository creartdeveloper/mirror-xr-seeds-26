import { db } from "../../firebase.js";

import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc, 
  doc,orderBy, Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
/* get show id */

const params = new URLSearchParams(window.location.search);
const showId = params.get("showId");

if (!showId) {
  console.error("No showId provided");
}

/* set up */

const DISPLAY_DURATION = 20000; //20 seconds

const TOTAL_COLUMNS = 6;
const TOTAL_ROWS = 6;

const ALLOWED_COLUMNS = [1, 2, 5, 6];
const ALLOWED_ROWS = [2, 3, 4, 5, 6];

const SLOT_POSITIONS = [];
const MAX_MESSAGES = 20;
let activeMessages = [];

for (let row of ALLOWED_ROWS) {
    for (let col of ALLOWED_COLUMNS){
        SLOT_POSITIONS.push({ row, col });
    }
}

let currentSlotIndex = 0;
/* Listeners */

if (showId) {

  /* ---------- CHAT LISTENER ---------- */
  const chatQuery = query(
    collection(db, "chat_message_collection"),
    where("showId", "==", showId),
  );
  
  onSnapshot(chatQuery, (snapshot) => {

    snapshot.docChanges().forEach((change) => {

      if (change.type === "added") {
        const data = change.doc.data();

        if (!data.chat?.trim()) return;

        // Prevent duplicate rendering
        if (activeMessages.some(m => m.dataset.id === change.doc.id)) return;

        showMessage(data, change.doc.id);
      }

    });

  });

  /* ---------- EMOJI LISTENER ---------- */

  const emojiQuery = query(
    collection(db, "emoji"),
    where("showId", "==", showId)
  );

  onSnapshot(emojiQuery, (snapshot) => {

    snapshot.docChanges().forEach(async (change) => {

      if (change.type === "added") {

        const data = change.doc.data();

        if (data.emoji) {
          showEmoji(data.emoji);
        }
      }

    });

  });

}

/*show Message  */
function showMessage(data, messageId) {

  const container = document.querySelector('.chat-container');
  if (!container) return;

  const slot = SLOT_POSITIONS[currentSlotIndex % SLOT_POSITIONS.length];
  currentSlotIndex++;

  const columnWidth = 100 / TOTAL_COLUMNS;
  const rowWidth = 100 / TOTAL_ROWS;

  const div = document.createElement('div');
  div.className = 'floating-message';
  div.dataset.id = messageId;

  div.innerHTML = `
    <div class="bubble-content">
        <div class="chat-text">${data.chat}</div>

        <div class="username">${data.username}</div>

        <div class="avatar-wrapper" style="background:${data.avatarBgColor}">
            <img src="${data.avatar}" />
        </div>

        <button class="delete-btn">×</button>
    </div>
  `;
 
  div.style.left = ((slot.col - 1) * columnWidth + columnWidth * 0.15) + "%";
  div.style.top = ((slot.row - 1) * rowWidth + rowWidth * 0.3) + "%";

  container.appendChild(div);
// Auto remove after 30 seconds
// Auto remove after 30 seconds (UI + Firestore)
  setTimeout(async () => {
    if (!div.isConnected) return;
    // Remove visually
    div.classList.remove("visible");

    setTimeout(() => {
      div.remove();
      activeMessages = activeMessages.filter(el => el !== div);
    }, 300);

    // Delete from Firestore
    try {
      await deleteDoc(doc(db, "chat_message_collection", messageId));
    } catch (error) {
      console.error("Error auto deleting message:", error);
    }

  }, DISPLAY_DURATION);

  requestAnimationFrame(() => {
    div.classList.add("visible");
  });

  activeMessages.push(div);

  if (activeMessages.length > MAX_MESSAGES) {
    const oldest = activeMessages.shift();
    oldest.remove();
  }

  //delete individual chat logic
const deleteBtn = div.querySelector(".delete-btn");

deleteBtn.addEventListener("click", async (e) => {
  e.stopPropagation();

  try {
    await deleteDoc(doc(db, "chat_message_collection", messageId));
  } catch (error) {
    console.error("Error deleting message:", error);
  }

  div.remove();
  activeMessages = activeMessages.filter(el => el !== div);
});
}
/* show emoji */

function showEmoji(emoji) {

  const container = document.querySelector('.chat-container');
  if (!container) return;

  const div = document.createElement('div');
  div.className = 'floating-emoji';
  div.innerText = emoji;
  div.style.willChange = "transform, opacity";

  const side = Math.random() < 0.5 ? "left" : "right";

  let left = side === "left"
    ? Math.random() * 25 + 5
    : Math.random() * 25 + 70;

  div.style.left = left + "%";
  div.style.top = "85%";

  container.appendChild(div);

  requestAnimationFrame(() => {
    div.classList.add("visible");
  });

  setTimeout(() => {
    div.classList.remove("visible");
    setTimeout(() => div.remove(), 500);
  }, 4000);
}
