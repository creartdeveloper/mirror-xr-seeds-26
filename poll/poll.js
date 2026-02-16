import { db } from "../firebase.js";
import {onSnapshot,collection,doc, setDoc,addDoc,serverTimestamp,Timestamp} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";


document.addEventListener("DOMContentLoaded", () => {
  // ID for live show session
  const showId   = sessionStorage.getItem("showId");
  //users unique ID
  let userId   = sessionStorage.getItem("userId");


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

  if(!userId || !levelId) {
    console.error("Missing userId or levelId.Redirecting to profile.");
    window.location.href ="../user-id/user-id.html";
    return;
  }

  const showRef = doc(db, "shows", "show_" + showId);

  onSnapshot(showRef, (snap) => {
    const data = snap.data();
    if (!data) return;

    const activePoll = data.currentPoll;

    showOnlyThatPoll(activePoll);
  });
  let pollUnlocked = false; 

  // Create waiting overlay
  const waitingOverlay = document.createElement("div");
  waitingOverlay.style.position = "fixed";
  waitingOverlay.style.top = 0;
  waitingOverlay.style.left = 0;
  waitingOverlay.style.width = "100%";
  waitingOverlay.style.height = "100%";
  waitingOverlay.style.background = "rgba(0,0,0,0.6)";
  waitingOverlay.style.color = "white";
  waitingOverlay.style.display = "flex";
  waitingOverlay.style.alignItems = "center";
  waitingOverlay.style.justifyContent = "center";
  waitingOverlay.style.fontSize = "24px";
  waitingOverlay.style.zIndex = "9999";
  waitingOverlay.textContent = "Please wait for the next part of the story...";
  waitingOverlay.style.display = "none";

  document.body.appendChild(waitingOverlay);

  let selectedOption = null;
  let hasSubmitted = false;

  const rows = document.querySelectorAll(".poll-item");
  const submitButton = document.getElementById("submitButton");
 
  function getCurrentLevel() {
    const activePoll = document.querySelector(".poll-container.active");
    return activePoll?.dataset.level;
  }

  const showRef = doc(db, "Mirror-XR-AF26-poll-magical-item", "show_" + showId);

  onSnapshot(showRef, (snapshot) => {
    const data = snapshot.data();
    if (!data) return;

    const activeLevel = data.currentPoll;

    // Hide all polls
    document.querySelectorAll(".poll-container")
      .forEach(p => p.classList.remove("active"));

    // Show only active poll
    const pollToShow = document.querySelector(
      `.poll-container[data-level="${activeLevel}"]`
    );

    if (pollToShow) {
      pollToShow.classList.add("active");
    }

  });

  /*vote submission*/

  async function submitVote(pollOption) {

    const levelId = getCurrentLevel();
    if (!levelId) return;

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

    if (!selectedOption || hasSubmitted ||!pollUnlocked) return;

    await submitVote(selectedOption);

    hasSubmitted = true;
    submitButton.disabled = true;
    submitButton.textContent = "Vote Submitted ";

  });
});