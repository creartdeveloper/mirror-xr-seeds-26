
import { db } from "./firebase.js";
import {onSnapshot,collection,doc, setDoc,addDoc,serverTimestamp,Timestamp} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";


document.addEventListener("DOMContentLoaded", () => {
  // ID for live show session
  const showId   = sessionStorage.getItem("showId");
  //users unique ID
  const userId   = sessionStorage.getItem("userId");


  if (!userId) {
    userId = crypto.randomUUID();
    sessionStorage.setItem("userId", userId);
  }

  if (!showId) {
    console.error("Missing showId");
    window.location.href = "../show-id.html";
    return;
  }

  //users selected username and avatar
  const username = sessionStorage.getItem("username");
  const avatar   = sessionStorage.getItem("avatar");
  // Restore username
  const usernameSpan = document.getElementById("chatUsername");
  if (usernameSpan && username) {
    usernameSpan.textContent = username;
  }

  // Restore avatar image
  const avatarImg = document.getElementById("chatAvatarImg");
  if (avatarImg && avatar) {
    avatarImg.src = avatar;
  }

  // Restore avatar background color
  const savedColor = sessionStorage.getItem("avatarColor");
  if (savedColor && avatarImg && avatarImg.parentElement) {
    avatarImg.parentElement.style.backgroundColor = savedColor;
  }

  // link polls 1 -4
  const parentPollOption = sessionStorage.getItem("parentPollOption") || null;

  // the poll type defined on each poll page
  const body = document.querySelector("body");
  const levelId = body?.dataset?.level; // p1 / p2 / p3/ p4

  if(!userId || !levelId) {
    console.error("Missing userId or levelId.Redirecting to profile.");
    window.location.href ="../user-id/user-id.html";
    return;
  }


  async function submitVote(pollOption) {
    await addDoc(
      collection(db, "Mirror-XR-AF26-poll-magical-item"),
      {
        showId,
        userId,
        username,
        avatar,
        levelId,
        pollOption,
        parentPollOption,
        timestamp: serverTimestamp()
      }
    );

    sessionStorage.setItem("parentPollOption", pollOption);
  }
  

  let selectedOption = null;
  let hasSubmitted = false;

  const rows = document.querySelectorAll(".option-row, .poll-item");
  const submitButton = document.getElementById("submitButton");

  // Disable submit initially
  submitButton.disabled = true;

  // When user selects an option
  rows.forEach(row => {
    row.addEventListener("click", () => {

      if (hasSubmitted) return; // lock after submit

      // Remove previous selection
      rows.forEach(r => r.classList.remove("selected"));

      // Highlight selected
      row.classList.add("selected");

      selectedOption = row.dataset.option?.toLowerCase();
      console.log("Selected:", selectedOption);
      if (selectedOption) {
        submitButton.disabled = false;
      }
    });
  });

  // When user clicks submit
  submitButton.addEventListener("click", async () => {

    if (!selectedOption || hasSubmitted) return;

    await submitVote(selectedOption);

    hasSubmitted = true;
    submitButton.disabled = true;
    submitButton.textContent = "Vote Submitted ";

  });
});