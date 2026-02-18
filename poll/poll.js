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
  const QUESTION_SETS = {

    Tea: [
      "Mira, my thoughts keep looping even when I want to relax. How do I make my brain slow down?",
      "Mira, is it okay if being quiet is how I feel calm, even if other people don’t get it?",
      "Mira, if mindfulness is like having tea, what happens if I get distracted or mess it up?",
      "Mira, how is mindfulness not just pretending problems aren’t there?"
    ],

    Kintsugi: [
      "Mira, I can’t stop thinking about my mistakes. How do I stop hating myself for them?",
      "Mira, what if I don’t want people to see the parts of me that feel broken?",
      "Mira, if cracks make things more beautiful, does that mean everyone has them, even you?",
      "Mira, is turning pain into something good actually real, or just something people say?"
    ],

    Jar: [
      "Mira, how do I stop my emotions from piling up in my head all day?",
      "Mira, what if I don’t know how to explain my feelings out loud?",
      "Mira, if I put my feelings in a jar, how do I know when it’s okay to open it again?",
      "Mira, isn’t putting emotions in a jar just avoiding them?"
    ],

    Pen: [
      "Mira, will writing things down actually stop my thoughts from spiralling?",
      "Mira, what if writing feels easier than talking. Does that still count?",
      "Mira, if the pen was magical, what would it help me say first?",
      "Mira, how can writing help if my situation stays the same?"
    ]
  };


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
    const selectedSet = data.selectedSet;

    document.querySelectorAll(".poll-container")
      .forEach(p => p.classList.remove("active"));

    const pollToShow = document.querySelector(
      `.poll-container[data-level="${currentLevel}"]`
    );

    if (pollToShow) {
      pollToShow.classList.add("active");
    }

    if (selectedSet && ["p2","p3","p4"].includes(currentLevel)) {
      renderQuestions(selectedSet, currentLevel);
    }

    hasSubmitted = !!data.votedUsers?.[currentLevel]?.[userId];
    document.querySelectorAll(".poll-option").forEach(option => {
      option.classList.remove("selected");

      const img = option.querySelector("img");
      if (img && img.dataset.default) {
        img.src = img.dataset.default;
      }
    });

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

    const container = optionEl.closest(".poll-container");
    if (!container || container.dataset.level !== currentLevel) return;

    const option = optionEl.dataset.option;
    if (!option) return;

    // Reset all images to default FIRST
    document.querySelectorAll(".poll-option img").forEach(img => {
      if (img.dataset.default) {
        img.src = img.dataset.default;
      }
    });

    // Change clicked image to selected version
    const img = optionEl.querySelector("img");
    if (img && img.dataset.selected) {
      img.src = img.dataset.selected;
    }

    optionEl.classList.add("selected");

    if (hasSubmitted) return;

    await submitVote(option.toLowerCase());
  });


  function renderQuestions(setName, level) {

    const questions = QUESTION_SETS[setName];
    if (!questions) return;

    const activePoll = document.querySelector(
      `.poll-container[data-level="${level}"]`
    );

    if (!activePoll) return;

    const optionEls = activePoll.querySelectorAll(".poll-option");

    optionEls.forEach((el, index) => {
      const textEl = el.querySelector(".option-text");
      if (textEl) {
        textEl.textContent = questions[index];
      }
    });
  }

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
