// document.addEventListener("DOMContentLoaded", () => {
//     const avatarImg = document.getElementById("chatAvatarImg");
//     const savedAvatar = sessionStorage.getItem("selectedAvatar");

//     if (avatarImg && savedAvatar) {
//         avatarImg.src = savedAvatar; 
//         avatarImg.style.display = "block";
//     }

//     const pollButtons = document.querySelectorAll(".poll-bar");

//     pollButtons.forEach(button => {
//         button.addEventListener("click", () => {
//             //remove previous selection 
//             pollButtons.forEach(b => b.classList.remove("selected"));

//             //mark selected
//             button.classList.add("selected");

//             const selectedOption = button.dataset.option;

//             sessionStorage.setItem("poll1Vote", selectedOption)
//         });
//     });

//     const nextButton = document.getElementById("nextButton");

//     if (nextButton) {
//         nextButton.addEventListener("click", () => {
//             const vote = sessionStorage.getItem("poll1Vote");

//             if(!vote) {
//                 alert("Please select an option first");
//                 return;
//             }

//             window.location.href = "poll2.html"
//         });
//     }
// });

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-storage.js";
import { getFirestore, collection, addDoc, getDocs, writeBatch,Timestamp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyDiCIatzcDsnHdX_t-m15S1a8pNlrB2egs",
    authDomain: "mira-7360b.firebaseapp.com",
    projectId: "mira-7360b",
    storageBucket: "mira-7360b.appspot.com",
    messagingSenderId: "76074103771",
    appId: "1:76074103771:web:1a2d4ca7e8b5df27a82dfe",
    measurementId: "G-9YL8FHBDRX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const showId   = sessionStorage.getItem("showId") || "test-show-1";
const userId   = sessionStorage.getItem("userId") || "test-user";
const username = sessionStorage.getItem("username") || "TestUser";
const avatar   = sessionStorage.getItem("avatar") || "";
const parentPollKey = sessionStorage.getItem("parentPollKey") || null;
const levelId = document.body.dataset.level; // p1 / p2 / p3 / p4
const path = sessionStorage.getItem("pollPath") || "";

if (!levelId) {
  console.error("Missing data-level on body");
}

async function submitVote(pollKey) {
  try {
    await addDoc(
      collection(db, "Mirror-XR-AF26-poll-magical-item"),
      {
        showId,
        userId,
        username,
        avatar,
        levelId,
        pollKey,
        parentPollKey,
        timestamp: Timestamp.now()
      }
    );

    console.log("Vote saved:", pollKey);

    sessionStorage.setItem("parentPollKey", pollKey);
  } catch (err) {
    console.error("Vote failed:", err);
  }
}

// UI
document.querySelectorAll(".poll-bar").forEach(btn => {
  btn.addEventListener("click", () => {
    const pollKey = btn.dataset.option.toLowerCase(); // A → a
    submitVote(pollKey);
  });
});

//next button 
const nextButton = document.getElementById("nextButton");
if (nextButton) {
  nextButton.addEventListener("click", () => {
    const vote = sessionStorage.getItem("poll1Vote");
    if (!vote) {
      alert("Please select an option first");
      return;
    }
    window.location.href = "poll2.html";
  });
}