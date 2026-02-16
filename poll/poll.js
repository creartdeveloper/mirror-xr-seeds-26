import { db } from "../firebase.js";
import { 
  onSnapshot, 
  collection, 
  doc, 
  addDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  const COLLECTION_NAME = "Mirror-XR-AF26-poll-magical-item";

  const showId = sessionStorage.getItem("showId");
  let userId = sessionStorage.getItem("userId");

  if (!userId) {
    userId = crypto.randomUUID();
    sessionStorage.setItem("userId", userId);
  }

  if (!showId) {
    console.error("No showId found");
    window.location.href = "../show-id.html";
    return;
  }

  // Restore username + avatar
  const username = sessionStorage.getItem("username");
  const avatar = sessionStorage.getItem("avatar");

  const usernameSpan = document.getElementById("chatUsername");
  const avatarImg = document.getElementById("chatAvatarImg");

  if (usernameSpan && username) usernameSpan.textContent = username;
  if (avatarImg && avatar) avatarImg.src = avatar;

  let selectedOption = null;
  let hasSubmitted = false;
  let currentLevel = null;

  const options = document.querySelectorAll(".poll-option");

  function getCurrentLevel() {
    return currentLevel;
  }

  /*listen to admin control */

  const controlRef = doc(
    db,
    COLLECTION_NAME,
    "show_" + showId
  );

  onSnapshot(controlRef, (snapshot) => {

    const data = snapshot.data();
    if (!data || !data.currentPoll) return;

    const activeLevel = data.currentPoll;

    currentLevel = activeLevel;

    // Hide all polls
    document.querySelectorAll(".poll-container")
      .forEach(p => p.classList.remove("active"));

    // Show only the active one
    const pollToShow = document.querySelector(
      `.poll-container[data-level="${activeLevel}"]`
    );

    if (pollToShow) {
      pollToShow.classList.add("active");
    }

    // Reset vote state for new poll
    hasSubmitted = false;
    selectedOption = null;

    options.forEach(o => o.classList.remove("selected"));
  });

  /* vote submit  */

  async function submitVote(option) {

    const levelId = getCurrentLevel();
    if (!levelId) return;

    await addDoc(
      collection(db, COLLECTION_NAME),
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

  /* option click handler */

  options.forEach(optionBtn => {

    optionBtn.addEventListener("click", async () => {

      if (hasSubmitted) return;

      options.forEach(o => o.classList.remove("selected"));
      optionBtn.classList.add("selected");

      selectedOption = optionBtn.dataset.option?.toLowerCase();

      if (selectedOption) {
        await submitVote(selectedOption);
      }
    });

  });

});
