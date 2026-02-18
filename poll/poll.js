import { db } from "../firebase.js";
import { 
  onSnapshot, 
  collection, 
  addDoc,
  doc,
  updateDoc, 
  increment,
  Timestamp 
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  const COLLECTION_NAME = "Mirror-XR-AF26-poll-magical-item";
  const EMOJI_COLLECTION = "emoji";
  const PAGE_TYPE = "poll";

  // const showId = sessionStorage.getItem("showId");
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
  const avatarBgColor = sessionStorage.getItem("avatarBgColor");
  const usernameSpan = document.getElementById("chatUsername");
  const avatarImg = document.getElementById("chatAvatarImg");

  const avatarWrapper = document.querySelector(".avatar-wrapper");

  if (avatarWrapper && avatarBgColor) {
    avatarWrapper.style.backgroundColor = avatarBgColor;
  }
  if (usernameSpan && username) usernameSpan.textContent = username;
  if (avatarImg && avatar) avatarImg.src = avatar;

  let hasSubmitted = false;
  let currentLevel = null;

  /* Listen to admin control document */
  const controlRef = doc(
    db,
    COLLECTION_NAME, showId
  );

  onSnapshot(controlRef, (snapshot) => {

    const data = snapshot.data();
    if (!data) return;

    /* page redirection logic */
    if (data.currentPage === "chat") {
      window.location.href = "../mirror-xr-chat/chat.html";
      return;
    }

    if (data.currentPage === "userid") {
      window.location.href = "../../user-id/user-id.html";
      return;
    }

    if (data.currentPage !== "poll") return;

    /* EXISTING POLL LOGIC */
    currentLevel = data.currentPoll;

    document.querySelectorAll(".poll-container")
      .forEach(p => p.classList.remove("active"));

    const pollToShow = document.querySelector(
      `.poll-container[data-level="${currentLevel}"]`
    );

    if (pollToShow) {
      pollToShow.classList.add("active");
    }

    hasSubmitted = !!data.votedUsers?.[currentLevel]?.[userId];
    document.querySelectorAll(".poll-option")
      .forEach(o => o.classList.remove("selected"));
  });

  /*Submit vote */
  async function submitVote(option) {

    if (!currentLevel || hasSubmitted) return;
    hasSubmitted = true; 

    try {
      const showRef = doc(db, COLLECTION_NAME, showId);

      await updateDoc(showRef, {
        [`counts.${currentLevel}.${option}`]: increment(1),
        [`votedUsers.${currentLevel}.${userId}`]: true
      });

    } catch (error) {
      console.error("Vote error:", error);
      hasSubmitted = false;
    }
  }

  /* Click handling for 2-column rows */

  document.addEventListener("click", async (e) => {
    const optionEl = e.target.closest(".poll-option");
    if (!optionEl) return;
    if (hasSubmitted) return;

    const option = optionEl.dataset.option;
    if (!option) return;

    // Only allow clicking inside active poll
    const container = optionEl.closest(".poll-container");
    if (!container || container.dataset.level !== currentLevel) return;

    document.querySelectorAll(".poll-option")
      .forEach(o => o.classList.remove("selected"));

    optionEl.classList.add("selected");

    await submitVote(option.toLowerCase());
  });

  document.querySelectorAll('.emoji-button').forEach(button => {
      button.addEventListener('click', async function() {
          // // Remove selected class from all buttons
          // document.querySelectorAll('.emoji-btn').forEach(btn => {
          //     btn.classList.remove('emoji-selected');
          // });
          
          // // Add selected class to clicked button
          // this.classList.add('emoji-selected');
          
          // Get emoji index and content
          const emojiContent = this.textContent;

          try {
              // Create data object for Firestore
              const emojiData = {
                  showId: showId,
                  emoji: emojiContent,
                  timestamp: Timestamp.now(),
                  pageType: PAGE_TYPE
              };
              
              await addDoc(collection(db, EMOJI_COLLECTION), emojiData);
              // Add document to Firestore
          } catch (error) {
              console.error("Error adding emoji to Firestore: ", error);
          }
      });
  });
});
