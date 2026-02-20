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
const MAX_ACTIVE = 15;
const DISPLAY_DURATION = 100000;
let activeMessages = [];

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
                showMessage(data.chat);
            }
        });

    });
}


let leftStack = [];
let rightStack = [];

const MAX_PER_COLUMN = 6;
const START_Y = 8;      // top start %
const VERTICAL_GAP = 14; // spacing between bubbles
const BOTTOM_LIMIT = 65; // do not go below this %

function showMessage(text) {

    const container = document.querySelector('.chat-container');
    if (!container) return;

    // Decide column (shorter one first)
    const useLeft = leftStack.length <= rightStack.length;

    if (useLeft && leftStack.length >= MAX_PER_COLUMN) return;
    if (!useLeft && rightStack.length >= MAX_PER_COLUMN) return;

    const div = document.createElement('div');
    div.className = 'floating-message';
    div.innerText = text;

    // Determine vertical position
    const stack = useLeft ? leftStack : rightStack;
    const topPosition = START_Y + (stack.length * VERTICAL_GAP);

    if (topPosition > BOTTOM_LIMIT) return;

    // Horizontal positioning
    if (useLeft) {
        div.style.left = "6%";
    } else {
        div.style.left = "74%";
    }

    div.style.top = topPosition + "%";

    container.appendChild(div);

    requestAnimationFrame(() => {
        div.classList.add("visible");
    });

    stack.push(div);

    setTimeout(() => {
        div.classList.remove("visible");
        setTimeout(() => {
            div.remove();
            stack.shift();
            repositionStacks();
        }, 400);
    }, DISPLAY_DURATION);
}

function repositionStacks() {

    leftStack.forEach((bubble, index) => {
        bubble.style.top = (START_Y + (index * VERTICAL_GAP)) + "%";
    });

    rightStack.forEach((bubble, index) => {
        bubble.style.top = (START_Y + (index * VERTICAL_GAP)) + "%";
    });
}