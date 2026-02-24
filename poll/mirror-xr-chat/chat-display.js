import { db } from "../../firebase.js";

import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
/* get show id */

const params = new URLSearchParams(window.location.search);
const showId = params.get("showId");

if (!showId) {
  console.error("No showId provided");
}

/* =============================
   SETTINGS + GRID CONFIG
============================= */

const DISPLAY_DURATION = 30000;

const TOTAL_COLUMNS = 6;
const TOTAL_ROWS = 6;

const ALLOWED_COLUMNS = [2, 3, 4, 5];
const ALLOWED_ROWS = [2, 3, 4, 5, 6];

const SLOT_POSITIONS = [];

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
    where("showId", "==", showId)
  );

  onSnapshot(chatQuery, (snapshot) => {

    snapshot.docChanges().forEach(async (change) => {

      if (change.type === "added") {

        const data = change.doc.data();
        const message = data.chat?.trim();

        if (message) {
          showMessage(data);
        }

        deleteDoc(change.doc.ref);
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

        deleteDoc(change.doc.ref);
      }

    });

  });

}

/*show Message  */
function showMessage(data) {

  const container = document.querySelector('.chat-container');
  if (!container) return;

  const slot = SLOT_POSITIONS[currentSlotIndex % SLOT_POSITIONS.length];
  currentSlotIndex++;

  const columnWidth = 100 / TOTAL_COLUMNS;
  const rowWidth = 100 / TOTAL_ROWS;

  const div = document.createElement('div');
  div.className = 'floating-message';

  div.innerHTML = `
    <div class="msg-avatar" style="background:${data.avatarBgColor}">
      <img src="${data.avatar}" />
    </div>
    <div class="msg-content">
      <div class="msg-username">${data.username}</div>
      <div class="msg-text">${data.chat}</div>
    </div>
  `;

  div.style.position = "absolute";
  div.style.left = ((slot.col - 1) * columnWidth + columnWidth * 0.2) + "%";
  div.style.top = ((slot.row - 1) * rowWidth + rowWidth * 0.3) + "%";

  container.appendChild(div);

  requestAnimationFrame(() => {
    div.classList.add("visible");
  });

  setTimeout(() => {
    div.classList.remove("visible");
    setTimeout(() => div.remove(), 400);
    }, DISPLAY_DURATION);
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
/*clear Button */

const clearBtn = document.getElementById("clearMessagesBtn");

if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    document.querySelectorAll(".floating-message").forEach(el => el.remove());
    document.querySelectorAll(".floating-emoji").forEach(el => el.remove());
    occupiedSlots.clear();
  });
}