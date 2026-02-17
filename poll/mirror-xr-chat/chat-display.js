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
const showId = params.get("showId");

if (!showId) {
    console.error("No showId in URL.");
}

/* settings */
const GRID_SIZE = 8;          // 8x8 = 64
const MAX_ACTIVE = 25;
const DISPLAY_DURATION = 20000;

let activeCount = 0;
let gridSlots = [];

/* Create 8x8 Grid */
function createGrid() {
    const container = document.querySelector('.chat-container');

    for (let row = 1; row <= GRID_SIZE; row++) {
        for (let col = 1; col <= GRID_SIZE; col++) {

            // Skip center 4 cells for Mira
            if ((row === 4 || row === 5) && (col === 4 || col === 5)) {
                continue;
            }

            const div = document.createElement('div');
            div.className = 'text-display';
            div.style.opacity = "0";

            const content = document.createElement('div');
            content.className = 'text-content';

            div.appendChild(content);
            container.appendChild(div);

            gridSlots.push(div);
        }
    }
}

/*Show Message */
function showMessage(text) {

    if (activeCount >= MAX_ACTIVE) return;

    // find free slot
    const freeSlot = gridSlots.find(slot => slot.style.opacity === "0");
    if (!freeSlot) return;

    const content = freeSlot.querySelector('.text-content');

    content.textContent = text;
    freeSlot.style.opacity = "1";

    activeCount++;

    setTimeout(() => {
        freeSlot.style.opacity = "0";
        activeCount--;
    }, DISPLAY_DURATION);
}

/* init */
createGrid();

/* real time listener (filtered by show) */
const q = query(
    collection(db, "chat_message_collection"),
    where("showId", "==", showId),
    orderBy("timestamp", "asc")
);

onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach(change => {
        if (change.type === "added") {
            const data = change.doc.data();
            showMessage(data.chat);
        }
    });
});
