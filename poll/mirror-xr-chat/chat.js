import { initializeApp } from 
"https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";

import { 
  getFirestore, 
  collection, 
  addDoc, 
  Timestamp,
  doc,
  onSnapshot
} from 
"https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";


document.addEventListener("DOMContentLoaded", () => {

  /* Firebase Config */
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

  /* Session Data */
  const showId = sessionStorage.getItem("showId");
  const username = sessionStorage.getItem("username") || "";
  const avatar = sessionStorage.getItem("avatar") || "";
  const avatarBgColor = sessionStorage.getItem("avatarBgColor") || "";

  if (!showId) {
    alert("Show not initialized.");
    return;
  }

  /* Redirect Listener */
  const showRef = doc(
    db,
    "Mirror-XR-AF26-poll-magical-item",
    showId
  );

  onSnapshot(showRef, (docSnap) => {
    if (!docSnap.exists()) return;

    const data = docSnap.data();
    if (!data || !data.currentPage) return;

    // If admin moves to poll → go to poll page
    if (data.currentPage === "poll") {
      if (!window.location.pathname.includes("poll.html")) {
        window.location.href = "../poll.html";
      }
      return;
    }

    // If admin moves to userid → go to user setup
    if (data.currentPage === "userid") {
      if (!window.location.pathname.includes("user-id.html")) {
        window.location.href = "../../user-id/user-id.html";
      }
      return;
    }

    // If currentPage is "chat" → DO NOTHING
  });

  /* Display Avatar + Username */
  const usernameDisplay = document.getElementById("chatUsername");
  const avatarImg = document.getElementById("chatAvatarImg");
  const avatarWrapper = document.querySelector(".avatar-wrapper");

  if (usernameDisplay) usernameDisplay.textContent = username;
  if (avatarImg) avatarImg.src = avatar;
  if (avatarWrapper) avatarWrapper.style.backgroundColor = avatarBgColor;

  /* Chat Logic */
  const CHAT_MESSAGE_COLLECTION = "chat_message_collection";
  const EMOJI_COLLECTION = "emoji";

  const sendButton = document.querySelector(".send-button");
  const textArea = document.querySelector(".msg-text-box");

  sendButton.addEventListener("click", () => {
    const message = textArea.value.trim();

    if (!message) return;
    if (!validateMessage(message)) return;

    addChat(message);
    textArea.value = "";
  });

  document.querySelectorAll(".emoji-button").forEach(button => {
    button.addEventListener("click", async () => {
      const emojiContent = button.textContent;

      await addDoc(collection(db, EMOJI_COLLECTION), {
        emoji: emojiContent,
        showId: showId,
        timestamp: Timestamp.now()
      });
    });
  });

  async function addChat(text) {
    await addDoc(collection(db, CHAT_MESSAGE_COLLECTION), {
      showId: showId,
      username: username,
      avatar: avatar,
      avatarBgColor: avatarBgColor,
      chat: text,
      timestamp: Timestamp.now()
    });
  }

  function validateMessage(text) {
    const words = text.trim().split(/\s+/);

    if (words.length > 20) {
      alert("Max 20 words allowed.");
      return false;
    }

    return true;
  }

});
