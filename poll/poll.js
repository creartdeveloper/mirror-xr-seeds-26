import { db } from "../firebase.js";
import { 
  onSnapshot,
  collection,
  doc,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  const showId = sessionStorage.getItem("showId");
  let userId = sessionStorage.getItem("userId");

  if (!userId) {
    userId = crypto.randomUUID();
    sessionStorage.setItem("userId", userId);
  }

  // if (!showId) {
  //   console.error("Missing showId");
  //   window.location.href = "../show-id.html";
  //   return;
  // }

  /* Restore user info */

  const username = sessionStorage.getItem("username");
  const avatar = sessionStorage.getItem("avatar");

  const usernameSpan = document.getElementById("chatUsername");
  if (usernameSpan && username) {
    usernameSpan.textContent = username;
  }

  const avatarImg = document.getElementById("chatAvatarImg");
  if (avatarImg && avatar) {
    avatarImg.src = avatar;
  }

  const savedColor = sessionStorage.getItem("avatarColor");
  if (savedColor && avatarImg?.parentElement) {
    avatarImg.parentElement.style.backgroundColor = savedColor;
  }

  const parentPollOption = sessionStorage.getItem("parentPollOption") || null;

  /* ==============================
     ACTIVE POLL CONTROL (FROM SHOWS COLLECTION)
     ============================== */

  const showRef = doc(db, "shows", "show_" + showId);

  onSnapshot(showRef, (snap) => {
    if (!snap.exists()) return;

    const data = snap.data();
    const activeLevel = data.currentPoll;

    document.querySelectorAll(".poll-container")
      .forEach(p => p.classList.remove("active"));

    const pollToShow = document.querySelector(
      `.poll-container[data-level="${activeLevel}"]`
    );

    if (pollToShow) {
      pollToShow.classList.add("active");
    }
  });

  /* ==============================
     WAITING OVERLAY (KEPT)
     ============================== */

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

  /* ==============================
     SELECTION + SUBMIT
     ============================== */

  let selectedOption = null;
  let hasSubmitted = false;

  const rows = document.querySelectorAll(".poll-option");
  const submitButton = document.getElementById("submitButton");

  function getCurrentLevel() {
    const activePoll = document.querySelector(".poll-container.active");
    return activePoll?.dataset.level;
  }

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

  if (submitButton) submitButton.disabled = true;

  rows.forEach(row => {
    row.addEventListener("click", () => {

      if (hasSubmitted) return;

      rows.forEach(r => r.classList.remove("selected"));
      row.classList.add("selected");

      selectedOption = row.dataset.option?.toLowerCase();

      if (submitButton) submitButton.disabled = !selectedOption;
    });
  });

  if (submitButton) {
    submitButton.addEventListener("click", async () => {

      if (!selectedOption || hasSubmitted) return;

      await submitVote(selectedOption);

      hasSubmitted = true;
      submitButton.disabled = true;
      submitButton.textContent = "Vote Submitted";
    });
  }

});
