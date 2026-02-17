import { db } from "../firebase.js";
import { 
  onSnapshot, 
  collection, 
  doc,
  updateDoc, 
  increment,
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  const COLLECTION_NAME = "Mirror-XR-AF26-poll-magical-item";
  const EMOJI_COLLECTION = "emoji";
  const PAGE_TYPE = "chat";

  // const showId = sessionStorage.getItem("showId");
  const showId = "1200";
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

  if (usernameSpan && username) usernameSpan.textContent = username;
  if (avatarImg && avatar) avatarImg.src = avatar;

  let hasSubmitted = false;
  let currentLevel = null;

  const allOptions = document.querySelectorAll(".poll-option");

  /* Listen to admin control document */
  const controlRef = doc(
    db,
    COLLECTION_NAME, showId
  );

  onSnapshot(controlRef, (snapshot) => {
    console.log("Control snapshot:", snapshot.data());
    const data = snapshot.data();
    if (!data || !data.currentPoll) {
      console.log("No currentPoll found");
      return;
    }
    currentLevel = data.currentPoll;
    console.log("Current level set to:", currentLevel);

    // Hide all polls
    document.querySelectorAll(".poll-container")
      .forEach(p => p.classList.remove("active"));

    // Show active poll
    const pollToShow = document.querySelector(
      `.poll-container[data-level="${currentLevel}"]`
    );

    if (pollToShow) {
      pollToShow.classList.add("active");
    }
    // Reset state when poll changes
    hasSubmitted = !!data.votedUsers?.[currentLevel]?.[userId];

    allOptions.forEach(o => o.classList.remove("selected"));
  });

  /*Submit vote */
  async function submitVote(option) {

    if (!currentLevel || hasSubmitted) return;

    try {
      const showRef = doc(db, COLLECTION_NAME, showId);

      await updateDoc(showRef, {
      [`counts.${currentLevel}.${option}`]: increment(1),
      [`votedUsers.${currentLevel}.${userId}`]: true
    });
      hasSubmitted = true;

    } catch (error) {
      console.error("Vote error:", error);
    }
  }

  /* Click handling for 2-column rows */
  allOptions.forEach(optionRow => {

    optionRow.addEventListener("click", async () => {

      if (hasSubmitted) return;

      const option = optionRow.dataset.option;
      if (!option) return;

      // Remove previous selection
      allOptions.forEach(o => o.classList.remove("selected"));

      // Highlight clicked row
      optionRow.classList.add("selected");
      console.log("Clicked option:", option);

      await submitVote(option.toLowerCase());
    });

  });

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
        const emojiIndex = this.getAttribute('data-index');
        const emojiContent = this.textContent;

        try {
            // Create data object for Firestore
            const emojiData = {
                emoji: emojiContent,
                timestamp: Timestamp.now(),
                pageType: PAGE_TYPE
            };

            // Add document to Firestore
            const docRef = await addDoc(collection(db, EMOJI_COLLECTION), emojiData);
            console.log("Emoji recorded with ID: ", docRef.id);
        } catch (error) {
            console.error("Error adding emoji to Firestore: ", error);
        }
    });
});
