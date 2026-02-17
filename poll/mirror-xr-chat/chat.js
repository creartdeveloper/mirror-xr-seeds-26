import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getFirestore, collection, addDoc, Timestamp } 
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

const CHAT_MESSAGE_COLLECTION = "chat_message_collection";
const EMOJI_COLLECTION = "emoji";

const sendButton = document.querySelector('.send-button');
const textArea = document.querySelector('.msg-text-box');

const showId = sessionStorage.getItem("showId");
const username = sessionStorage.getItem("username") || "";

/*if show not set */
if (!showId) {
    console.error("No showId set.");
    alert("Show not initialized.");
}

/*Send Chat */
sendButton.addEventListener('click', function() {
    const message = textArea.value.trim();

    if (!message) return;

    if (!validateMessage(message)) return;

    addChat(message);
    textArea.value = '';
});

/*Send Emoji */
document.querySelectorAll('.emoji-button').forEach(button => {
    button.addEventListener('click', async function() {

        const emojiContent = this.textContent;

        try {
            await addDoc(collection(db, EMOJI_COLLECTION), {
                emoji: emojiContent,
                showId: showId,
                timestamp: Timestamp.now()
            });
        } catch (error) {
            console.error("Error adding emoji:", error);
        }
    });
});

/*Add Chat To Firestore */
async function addChat(text) {
    try {
        await addDoc(collection(db, CHAT_MESSAGE_COLLECTION), {
            showId: showId,
            username: username,
            chat: text,
            timestamp: Timestamp.now()
        });
    } catch (e) {
        console.error("Error adding document:", e);
    }
}

/*Validation */
function validateMessage(text) {
    const words = text.trim().split(/\s+/);

    if (words.length > 5) {
        alert("Max 5 words allowed.");
        return false;
    }

    const badWords = ["badword1", "badword2"];

    for (let word of words) {
        if (badWords.includes(word.toLowerCase())) {
            alert("Inappropriate language.");
            return false;
        }
    }

    return true;
}
