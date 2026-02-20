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
const showIdParam = params.get("showId");

const showId = showIdParam ? Number(showIdParam) : null;

console.log("projection showId:", showId);

if (!showId) {
    console.error("Invalid showId in URL");
}
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

/* settings */ 
const MAX_ACTIVE = 15;
const DISPLAY_DURATION = 100000;

let activeMessages = [];

/* predefined positions around center */
const positions = [
    // LEFT COLUMN
    { top: "10%", left: "8%" },
    { top: "25%", left: "8%" },
    { top: "40%", left: "8%" },
    { top: "55%", left: "8%" },
    { top: "70%", left: "8%" },
    { top: "85%", left: "8%" },

    // RIGHT COLUMN
    { top: "10%", left: "72%" },
    { top: "25%", left: "72%" },
    { top: "40%", left: "72%" },
    { top: "55%", left: "72%" },
    { top: "70%", left: "72%" },
    { top: "85%", left: "72%" }
];

/*Show Message */
function showMessage(text) {

    if (activeMessages.length >= MAX_ACTIVE) return;

    const container = document.querySelector('.chat-container');

    const div = document.createElement('div');
    div.className = 'floating-message';
    div.textContent = text;

    // pick random position
    const index = activeMessages.length % positions.length;
    const randomPos = positions[index];
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
    if (showId !== null) {

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
};
