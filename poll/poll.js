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

  if (!showId) {
    window.location.href = "../show-id.html";
    return;
  }

  const username = sessionStorage.getItem("username");
  const avatar = sessionStorage.getItem("avatar");

  const usernameSpan = document.getElementById("chatUsername");
  const avatarImg = document.getElementById("chatAvatarImg");

  if (usernameSpan) usernameSpan.textContent = username;
  if (avatarImg && avatar) avatarImg.src = avatar;

  let selectedOption = null;
  let hasSubmitted = false;

  const rows = document.querySelectorAll(".poll-option");

  function getCurrentLevel() {
    const active = document.querySelector(".poll-container.active");
    return active?.dataset.level;
  }

  // listen to control document
  const controlRef = doc(
    db,
    "Mirror-XR-AF26-poll-magical-item",
    "show_" + showId
  );

  onSnapshot(controlRef, (snapshot) => {
    const data = snapshot.data();
    if (!data) return;

    const activeLevel = data.currentPoll;

    document.querySelectorAll(".poll-container")
      .forEach(p => p.classList.remove("active"));

    const pollToShow = document.querySelector(
      `.poll-container[data-level="${activeLevel}"]`
    );

    if (pollToShow) {
      pollToShow.classList.add("active");
      hasSubmitted = false;   // reset submission when new poll opens
      selectedOption = null;
    }
  });

  // vote submission
  async function submitVote(option) {

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
        pollOption: option,
        timestamp: serverTimestamp()
      }
    );

    hasSubmitted = true;
  }

  // option click
  rows.forEach(row => {
    row.addEventListener("click", async () => {

      if (hasSubmitted) return;

      rows.forEach(r => r.classList.remove("selected"));
      row.classList.add("selected");

      selectedOption = row.dataset.option?.toLowerCase();

      if (selectedOption) {
        await submitVote(selectedOption);
      }
    });
  });

});
