import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

/* =============================
   FIREBASE SETUP
============================= */

const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "mira-7360b.firebaseapp.com",
  projectId: "mira-7360b",
  storageBucket: "mira-7360b.appspot.com",
  messagingSenderId: "76074103771",
  appId: "1:76074103771:web:1a2d4ca7e8b5df27a82dfe"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* =============================
   GET SHOW ID
============================= */

const params = new URLSearchParams(window.location.search);
const showId = params.get("showId");

if (!showId) {
  console.error("No showId provided");
}

/* =============================
   SETTINGS + GRID CONFIG
============================= */

const DISPLAY_DURATION = 30000;

const TOTAL_COLUMNS = 7;
const TOTAL_ROWS = 8;

const ALLOWED_COLUMNS = [2, 6];
const ALLOWED_ROWS = [2, 3, 4, 5, 6];

const occupiedSlots = new Set();

/* =============================
   LISTENERS
============================= */

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
          showMessage(message);
        }

        await deleteDoc(change.doc.ref);
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

        await deleteDoc(change.doc.ref);
      }

    });

  });

}

/* =============================
   SHOW MESSAGE
============================= */

function showMessage(text) {

  const container = document.querySelector('.chat-container');
  if (!container) return;

  let slot = null;

  for (let row of ALLOWED_ROWS) {
    for (let col of ALLOWED_COLUMNS) {

      const key = `${row}-${col}`;

      if (!occupiedSlots.has(key)) {
        slot = { row, col, key };
        break;
      }
    }
    if (slot) break;
  }

  if (!slot) return;

  const div = document.createElement('div');
  div.className = 'floating-message';
  div.innerText = text;

  const columnWidth = 100 / TOTAL_COLUMNS;
  const rowHeight = 100 / TOTAL_ROWS;

  const horizontalPadding = 0.25;
  const verticalPadding = 0.35;

  const left =
    (slot.col - 1) * columnWidth +
    (columnWidth * horizontalPadding);

  const top =
    (slot.row - 1) * rowHeight +
    (rowHeight * verticalPadding);

  div.style.left = left + "%";
  div.style.top = top + "%";

  container.appendChild(div);
  occupiedSlots.add(slot.key);

  requestAnimationFrame(() => {
    div.classList.add("visible");
  });

  setTimeout(() => {
    div.classList.remove("visible");
    setTimeout(() => {
      div.remove();
      occupiedSlots.delete(slot.key);
    }, 400);
  }, DISPLAY_DURATION);
}

/* =============================
   SHOW EMOJI
============================= */

function showEmoji(emoji) {

  const container = document.querySelector('.chat-container');
  if (!container) return;

  const div = document.createElement('div');
  div.className = 'floating-emoji';
  div.innerText = emoji;

  const side = Math.random() < 0.5 ? "left" : "right";

  let left;
  if (side === "left") {
    left = Math.random() * 25 + 5;
  } else {
    left = Math.random() * 25 + 70;
  }

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