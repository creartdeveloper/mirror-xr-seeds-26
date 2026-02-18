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

console.log("projection showId:", showId);

if (!showId) {
    console.error("No showId in URL.");
}

/* settings */ 
const MAX_ACTIVE = 15;
const DISPLAY_DURATION = 20000;

let activeMessages = [];

/* predefined positions around center */
const positions = [
    { top: "15%", left: "50%" },
    { top: "30%", left: "80%" },
    { top: "50%", left: "90%" },
    { top: "75%", left: "75%" },
    { top: "85%", left: "50%" },
    { top: "75%", left: "25%" },
    { top: "50%", left: "10%" },
    { top: "30%", left: "20%" }
];

/*Show Message */
function showMessage(text) {

    if (activeMessages.length >= MAX_ACTIVE) return;

    const container = document.querySelector('.chat-container');

    const div = document.createElement('div');
    div.className = 'floating-message';
    div.textContent = text;

    // pick random position
    const randomPos = positions[Math.floor(Math.random() * positions.length)];
    div.style.top = randomPos.top;
    div.style.left = randomPos.left;

    container.appendChild(div);
    activeMessages.push(div);

    // trigger fade-in
    requestAnimationFrame(() => {
        div.classList.add("visible");
    });

    setTimeout(() => {
        div.classList.remove("visible");
        setTimeout(() => {
            div.remove();
            activeMessages = activeMessages.filter(m => m !== div);
        }, 800); // match fade-out time
    }, DISPLAY_DURATION);
}


/* real time listener (filtered by show) */
const q = query(
    collection(db, "chat_message_collection"),
    where("showId", "==", showId)
);

onSnapshot(q, (snapshot) => {
    console.log("Snapshot size:", snapshot.size);

    snapshot.docChanges().forEach(change => {
        if (change.type === "added") {
            const data = change.doc.data();
            console.log("New message:", data.chat);
            showMessage(data.chat);
        }
    });
});
