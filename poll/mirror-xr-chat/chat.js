
import { db } from "../../firebase.js";

import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  Timestamp,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {

  async function validateShow(showId) {
    const showRef = doc(
      db,
      "mirror-xr-seeds",
      showId
    );

    const snap = await getDoc(showRef);

    if (!snap.exists() || snap.data().active !== true) {
      sessionStorage.clear();
      window.location.replace(
        "https://www.creartdigitalmedia.com.au/fringe-2026"
      );
      return;
    }
  }

  /* Session Data */
  const showId = sessionStorage.getItem("showId");
  if (!showId) {
    console.log("No showId in sessionStorage");
    return;
  }
await validateShow(showId);
  const username = sessionStorage.getItem("username") || "";
  const avatar = sessionStorage.getItem("avatar") || "";
  const avatarBgColor = sessionStorage.getItem("avatarBgColor") || "";

  let bannedWords = [];

  async function loadBadWords() {
    try {
      const snapshot = await getDocs(collection(db, "bad_words"));

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.word && typeof data.word === "string") {
          const wordsArray = data.word
            .toLowerCase()
            .split(/\s+/)       // split by spaces
            .filter(Boolean);   // remove empty values

        bannedWords.push(...wordsArray);
      }
    });

      console.log("Bad words loaded:", bannedWords.length);

    } catch (error) {
      console.error("Failed to load bad words:", error);
    }
  }

  await loadBadWords();

  if (containsHarmfulContent(username)) {
    alert("Inappropriate username not allowed.");
    sessionStorage.clear();
    window.location.replace("https://www.creartdigitalmedia.com.au/fringe-2026");
    return;
  }
  
  function normalizeText(text) {
    return text
      .toLowerCase()
      .replace(/[@4]/g, "a")
      .replace(/[!1]/g, "i")
      .replace(/3/g, "e")
      .replace(/0/g, "o")
      .replace(/5/g, "s")
      .replace(/7/g, "t")
      .replace(/\$/g, "s")
      .replace(/[^a-z]/g, "")
      .replace(/(.)\1+/g, "$1");
  }

  function containsEmoji(text) {
    return /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u.test(text);
  }

  function containsHarmfulContent(text) {
  const normalizedWords = text
    .split(/\s+/)
    .map(word => normalizeText(word))
    .filter(Boolean);

  const bannedSet = new Set(
    bannedWords
      .map(word => normalizeText(word))
      .filter(Boolean)
  );

  // Match complete words only
  if (normalizedWords.some(word => bannedSet.has(word))) {
    return true;
  }

  const harmfulPatterns = [
    /\b(kill|stab|shoot|bomb|attack)\b/i,
    /\bgo\s+die\b/i,
    /\bi\s*(?:will|'ll)?\s*(?:hurt|kill)\b/i,
    /\b(kill|cut|hang)\s+myself\b/i,
    /\bi\s+want\s+to\s+die\b/i,
    /\bi\s+hate\s+\w+/i
  ];

  return harmfulPatterns.some(pattern => pattern.test(text));
}


  let lastMessageTime = 0;

  function validateMessage(text) {

    const trimmed = text.trim();

    // Rate limit (1 message per 3 seconds)
    const now = Date.now();
    if (now - lastMessageTime < 3000) {
      alert("Please wait before sending another message.");
      return false;
    }

    if (trimmed.length < 2 || trimmed.length > 120) {
      alert("Invalid message length.");
      return false;
    }

    const words = trimmed.split(/\s+/);
    if (words.length > 20) {
      alert("Max 20 words allowed.");
      return false;
    }

    // Block pasted emojis
    if (containsEmoji(trimmed)) {
      alert("Emojis are not allowed in chat messages.");
      return false;
    }

    // Too many special characters
    if (/[^a-zA-Z0-9\s]{3,}/.test(trimmed)) {
      alert("Too many special characters.");
      return false;
    }

    // Repeated character spam (aaaaaaa)
    if (/(.)\1{5,}/.test(trimmed)) {
      alert("Spam not allowed.");
      return false;
    }

    // Block links
    if (/http|www|\.com|\.net|\.org/i.test(trimmed)) {
      alert("Links not allowed.");
      return false;
    }
    if (!/^[a-zA-Z0-9\s.,!?']+$/.test(trimmed)) {
      alert("Only letters and basic punctuation allowed.");
      return false;
    }

    if (containsHarmfulContent(trimmed)) {
      alert("Inappropriate content not allowed.");
      return false;
    }

    lastMessageTime = now;
    return true;
  }

  /* Redirect Listener */
  const showRef = doc(
    db,
    "mirror-xr-seeds",
    showId
  );

  onSnapshot(showRef, (docSnap) => {
    if (!docSnap.exists()) return;

    const data = docSnap.data();
    if (data.active === false) {
      sessionStorage.clear();
      window.location.replace(
        "https://www.creartdigitalmedia.com.au/fringe-2026"
      );
      return;
    }
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
  const CHAT_MESSAGE_COLLECTION = "chat_message_collection_seeds";
  const EMOJI_COLLECTION = "emoji_seeds";

  const sendButton = document.querySelector(".send-button");
  const textArea = document.querySelector(".msg-text-box");

  textArea.addEventListener("paste", (e) => {
    e.preventDefault();
    alert("Pasting is not allowed.");
  });

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
});


//The Start interaction
const starLayer = document.getElementById("starLayer");
const starCountDisplay = document.getElementById("starCount");

let collectedStars = 0;

function spawnStar() {
    const star = document.createElement("button");

    star.type = "button";
    star.className = "falling-star";
    star.textContent = "⭐";

    // Random horizontal spawn position
    const starWidth = 60;
    const maxLeft = window.innerWidth - starWidth;
    const randomLeft = Math.random() * maxLeft;

    star.style.left = `${randomLeft}px`;

    // Random falling speed
    const fallDuration = 10 + Math.random() * 5;

    star.style.setProperty(
        "--fall-duration",
        `${fallDuration}s`
    );

    // Slight random size variation
    const scale = 0.8 + Math.random() * 0.5;
    star.style.setProperty("--star-scale", scale);

    star.addEventListener("click", () => {
        if (star.classList.contains("collected")) {
            return;
        }

        star.classList.add("collected");

        collectedStars++;

        starCountDisplay.textContent = collectedStars;

        setTimeout(() => {
            star.remove();
        }, 350);
    });

    // Remove untapped star when it reaches bottom
    star.addEventListener("animationend", (event) => {
        if (
            event.animationName === "starFall" &&
            !star.classList.contains("collected")
        ) {
            star.remove();
        }
    });
    star.addEventListener("click", () => {

    collectedStars++;

    starCountDisplay.textContent = collectedStars;

    // Immediately remove star
    star.remove();

});

    starLayer.appendChild(star);
}


/*
Continuous random spawning
*/
function scheduleNextStar() {
    // Random time before next star:
    // 500ms – 1800ms
    const delay =
        500 + Math.random() * 1300;

    setTimeout(() => {
        spawnStar();
        scheduleNextStar();
    }, delay);
}


// Start
scheduleNextStar();