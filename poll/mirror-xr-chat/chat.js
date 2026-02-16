import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  Timestamp 
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDiCIatzcDsnHdX_t-m15S1a8pNlrB2egs",
  authDomain: "mira-7360b.firebaseapp.com",
  projectId: "mira-7360b",
  storageBucket: "mira-7360b.appspot.com",
  messagingSenderId: "76074103771",
  appId: "1:76074103771:web:1a2d4ca7e8b5df27a82dfe"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CHAT_COLLECTION = "af26_chat"; // projector mapping

//unique device ID per audience member
let userId = sessionStorage.getItem("userId");

if (!userId) {
  userId = crypto.randomUUID();
  sessionStorage.setItem("userId", userId);
}

const sendBtn = document.querySelector(".send-button");
const textInput = document.querySelector(".chat-input");

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
