import { db } from "../poll/firebase.js";
import { collection, addDoc, Timestamp } 
from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

const MAIN_COLLECTION = "Mirror-XR-AF26-poll-magical-item"; //create firestore document inside this
const showId = sessionStorage.getItem("showId");

const sendButton = document.querySelector('.pebble-button');
const textArea = document.querySelector('.msg-text-box');

sendButton.addEventListener('click', async () => {

    const message = textArea.value.trim();
    if (!message || !showId) return;

    try {
        await addDoc(collection(db, MAIN_COLLECTION), {
            //collection 
            type: "chatMessage",
            showId: showId,
            message: message,
            timestamp: Timestamp.now()
        });

        textArea.value = '';

    } catch (error) {
        console.error("Error sending message:", error);
    }
});
