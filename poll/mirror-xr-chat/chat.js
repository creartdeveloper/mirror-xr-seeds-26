import { db } from "../firebase.js";
import { 
  collection, 
  addDoc, 
  Timestamp,
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

const CHAT_COLLECTION = "af26_chat";

// Unique device ID
let userId = sessionStorage.getItem("userId");

if (!userId) {
  userId = crypto.randomUUID();
  sessionStorage.setItem("userId", userId);
}

const sendBtn = document.querySelector(".send-button");
const textInput = document.querySelector(".msg-text-box");

sendBtn.addEventListener("click", sendMessage);

async function sendMessage() {
  const message = textInput.value.trim();
  if (!message) return;

  try {
    await addDoc(collection(db, CHAT_COLLECTION), {
      device: userId,
      message: message,
      timestamp: Timestamp.now()
    });

    textInput.value = "";

  } catch (error) {
    console.error("Error sending message:", error);
  }
}

//Admin controls page switch
const showId = sessionStorage.getItem("showId");

if (showId) {

  const showRef = doc(db, "Mirror-XR-AF26-poll-magical-item", "show_" + showId);

  onSnapshot(showRef, (snap) => {

    if (!snap.exists()) return;

    const data = snap.data();
    const targetPage = data.currentPage;

    if (targetPage === "poll") {
      window.location.href = "../poll/poll.html";
    }

  });
}
