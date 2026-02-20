import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getFirestore, collection, query, where, orderBy, onSnapshot } 
from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

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

/* Get showId from URL */
const params = new URLSearchParams(window.location.search);
const showId = params.get("showId"); // or Number() if Firestore stores number

console.log("Projection showId:", showId);

if (!showId) {
    console.error("No showId provided");
}

/* settings */ 

const DISPLAY_DURATION = 30000;


if (showId) {

    const q = query(
        collection(db, "chat_message_collection"),
        where("showId", "==", showId)
    );

    onSnapshot(q, (snapshot) => {

        console.log("Snapshot size:", snapshot.size);

        snapshot.docChanges().forEach(change => {
            if (change.type === "added") {
                const data = change.doc.data();
                if (data.chat && data.chat.trim() !== "") {
                    showMessage(data.chat);
                }
            }
        });

    });
}

/* GRID CONFIG */

const TOTAL_COLUMNS = 3;
const TOTAL_ROWS = 8;

const ALLOWED_COLUMNS = [1, 3];   // left and right only
const ALLOWED_ROWS = [2, 3, 4, 5, 6];

const occupiedSlots = new Set();
function showMessage(text) {

    const container = document.querySelector('.chat-container');
    if (!container) return;

    let slot = null;

    // Find first available slot
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

    if (!slot) return; // grid full

    const div = document.createElement('div');
    div.className = 'floating-message';
    div.innerText = text;

    const columnWidth = 100 / TOTAL_COLUMNS;
    const rowHeight = 100 / TOTAL_ROWS;

    // spacing inside each grid cell
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