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
import { validateShow } from "../show-guard.js";

const params = new URLSearchParams(window.location.search);
const showId = params.get("showId");

await validateShow(showId);
document.addEventListener("DOMContentLoaded", () => {

  const COLLECTION_NAME = "Mirror-XR-AF26-poll-magical-item";
  const EMOJI_COLLECTION = "emoji";
  const PAGE_TYPE = "poll";

  const showId = sessionStorage.getItem("showId");
  console.log("USER SHOW ID:", showId);
  let userId = sessionStorage.getItem("userId");

  if (!userId) {
    userId = crypto.randomUUID();
    sessionStorage.setItem("userId", userId);
  }

  if (!showId) {
    window.location.href = "../show-id.html";
    return;
  }

  /* ----------------------------
     USER DISPLAY RESTORE
  ---------------------------- */

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

  /* ----------------------------
     STORY QUESTION STRUCTURE
  ---------------------------- */

  const QUESTION_SETS = {
  Tea: {

    // Poll 2 questions (Set 1)
    p2: [
      "Mira, how is mindfulness not just pretending problems aren’t there?",
      "Mira, if mindfulness is like having tea, what happens if I get distracted or mess it up?",
      "Mira, is it okay if being quiet is how I feel calm, even if other people don’t get it?",
      "Mira, my thoughts keep looping even when I want to relax. How do I make my brain slow down?"
    ],

    // Poll 3 branching based on Poll 2 winner
    p3: {
      a: [ // Dewdrop - Skeptic
        "You chose skepticism. What makes mindfulness feel unrealistic to you?",
        "If something feels fake, what would make it feel real?",
        "Is there a moment you felt present without trying?",
        "What would convince you mindfulness works?"
      ],
      b: [ // Whimsy - Curious
        "Curiosity can wander — what pulls your focus away?",
        "If mindfulness was playful, how would it feel?",
        "What part of tea-time feels grounding?",
        "How do you return when distracted?"
      ],
      c: [ // Twinkle - Shy
        "Does silence feel safe or isolating?",
        "What makes quiet powerful?",
        "When do you feel calm in stillness?",
        "How can quiet be strength?"
      ],
      d: [ // Pebble - Overthinker
        "What triggers your looping thoughts?",
        "If thoughts were clouds, could you watch them pass?",
        "What slows your mind naturally?",
        "When was the last time your mind rested?"
      ]
    }
  },  
  
  Kintsugi: {

    p2: [
      "Mira, is turning pain into something good actually real, or just something people say?",
      "Mira, if cracks make things more beautiful, does that mean everyone has them, even you?",
      "Mira, what if I don’t want people to see the parts of me that feel broken?",
      "Mira, I can’t stop thinking about my mistakes. How do I stop hating myself for them?"
    ],

    p3: {
      a: [
        "What feels fake about healing?",
        "Have you seen strength come from struggle?",
        "What would growth look like for you?",
        "What part of pain feels hardest to accept?"
      ],
      b: [
        "What makes broken things beautiful?",
        "Do cracks tell a story?",
        "Is imperfection something you notice in others?",
        "What would embracing cracks feel like?"
      ],
      c: [
        "Why hide what feels broken?",
        "Who do you trust with your cracks?",
        "What would safe vulnerability look like?",
        "What scares you about being seen?"
      ],
      d: [
        "Why do mistakes replay so loudly?",
        "What would forgiveness change?",
        "Are mistakes identity or experience?",
        "What would self-compassion feel like?"
      ]
    }
  },
  Jar: {

    p2: [
      "Mira, isn’t putting emotions in a jar just avoiding them?",
      "Mira, if I put my feelings in a jar, how do I know when it’s okay to open it again?",
      "Mira, what if I don’t know how to explain my feelings out loud?",
      "Mira, how do I stop my emotions from piling up in my head all day?"
    ],

    p3: {
      a: [
        "Is containment the same as suppression?",
        "What feels avoided?",
        "What emotion feels loudest?",
        "What would sitting with it feel like?"
      ],
      b: [
        "What tells you it's safe to open up?",
        "Is timing important?",
        "What would release feel like?",
        "How do you protect yourself emotionally?"
      ],
      c: [
        "What makes expression difficult?",
        "Are feelings clearer inside or outside?",
        "What language feels safest?",
        "Would writing feel easier?"
      ],
      d: [
        "What makes emotions pile up?",
        "Do they need space or structure?",
        "What drains emotional energy?",
        "How could you empty the jar gently?"
      ]
    }
  },
  Pen: {

    p2: [
      "Mira, how can writing help if my situation stays the same?",
      "Mira, if the pen was magical, what would it help me say first?",
      "Mira, what if writing feels easier than talking. Does that still count?",
      "Mira, will writing things down actually stop my thoughts from spiralling?"
    ],
    p3: {
      a: [
        "Can perspective shift without situation changing?",
        "What would clarity feel like?",
        "What would writing reveal?",
        "What feels stuck right now?"
      ],
      b: [
        "What would your first honest sentence be?",
        "If words had power, what would you rewrite?",
        "What truth wants to be spoken?",
        "What story do you want to change?"
      ],
      c: [
        "Why does writing feel safer?",
        "Is expression the goal or connection?",
        "What feels easier on paper?",
        "Does quiet reflection help?"
      ],
      d: [
        "What spirals most often?",
        "Does seeing thoughts reduce their power?",
        "What pattern repeats?",
        "What would slowing thoughts look like?"
      ]
    }
  }

};

  let hasSubmitted = false;
  let currentLevel = null;

  const controlRef = doc(db, COLLECTION_NAME, showId);

  /* ----------------------------
     REALTIME CONTROL LISTENER
  ---------------------------- */

  onSnapshot(controlRef, (snapshot) => {

    const data = snapshot.data();
    if (!data) return;

    /* Page Redirect Logic */
    if (data.currentPage === "chat") {
      window.location.href = "./mirror-xr-chat/chat.html";
      return;
    }

    if (data.currentPage === "userid") {
      window.location.href = "../user-id/user-id.html";
      return;
    }

    if (data.currentPage === "fringe") {
      window.location.href = "https://www.creartdigitalmedia.com.au/fringe-2026";
      return;
    }
    if (data.currentPage !== "poll") return;

    currentLevel = data.currentPoll;

    const selectedSet = data.selectedSet;
    const poll2Winner = data.poll2Winner;
    const poll3Winner = data.poll3Winner;

    /* Activate correct poll */
    document.querySelectorAll(".poll-container")
      .forEach(p => p.classList.remove("active"));

    const pollToShow = document.querySelector(
      `.poll-container[data-level="${currentLevel}"]`
    );

    if (pollToShow) pollToShow.classList.add("active");

    /* Render branching questions */
    if (selectedSet) {

      if (currentLevel === "p2") {
        renderToActivePoll(
          QUESTION_SETS[selectedSet]?.p2
        );
      }

      if (currentLevel === "p3" && poll2Winner) {
        renderToActivePoll(
          QUESTION_SETS[selectedSet]?.p3?.[poll2Winner]
        );
      }

      if (currentLevel === "p4" && poll3Winner) {
        renderToActivePoll(
          QUESTION_SETS[selectedSet]?.p4?.[poll3Winner]
        );
      }
    }

    /* Check vote state */
    hasSubmitted =
      data.votedUsers?.[currentLevel]?.[userId] || false;

    /* Reset UI visuals */
    document.querySelectorAll(".poll-option").forEach(option => {
      option.classList.remove("selected");

      const img = option.querySelector("img");
      if (img && img.dataset.default) {
        img.src = img.dataset.default;
      }
    });

  });

  /* ----------------------------
     VOTE SUBMISSION
  ---------------------------- */

  async function submitVote(option) {

    if (!currentLevel || hasSubmitted) return;
    hasSubmitted = true;

    try {
      const showRef = doc(db, COLLECTION_NAME, showId);

      await updateDoc(showRef, {
        [`counts.${currentLevel}.${option}`]: increment(1),
        [`votedUsers.${currentLevel}.${userId}`]: true
      });
      console.log("Submitting vote:", currentLevel, option);

    } catch (error) {
      console.error("Vote error:", error);
      hasSubmitted = false;
    }
  }

  /* ----------------------------
     CLICK HANDLING
  ---------------------------- */

  document.addEventListener("click", async (e) => {

    const optionEl = e.target.closest(".poll-option");
    if (!optionEl) return;

    const container = optionEl.closest(".poll-container");
    if (!container || !container.classList.contains("active")) return;

    const option = optionEl.dataset.option;
    if (!option) return;

    /* Reset images */
    document.querySelectorAll(".poll-option img").forEach(img => {
      if (img.dataset.default) {
        img.src = img.dataset.default;
      }
    });

    /* Set selected */
    const img = optionEl.querySelector("img");
    if (img && img.dataset.selected) {
      img.src = img.dataset.selected;
    }

    optionEl.classList.add("selected");

    if (hasSubmitted) return;

    await submitVote(option.toLowerCase());
  });

  /* ----------------------------
     RENDER FUNCTION
  ---------------------------- */

  function renderToActivePoll(questions) {

    if (!questions) return;

    const activePoll = document.querySelector(
      `.poll-container.active`
    );

    if (!activePoll) return;

    const optionEls = activePoll.querySelectorAll(".poll-option");

    optionEls.forEach((el, index) => {
      const textEl = el.querySelector(".option-text");
      if (textEl) {
        textEl.textContent = questions[index] || "";
      }
    });
  }

  /* ----------------------------
     EMOJI SYSTEM
  ---------------------------- */

  document.querySelectorAll('.emoji-button').forEach(button => {
    button.addEventListener('click', async function() {

      const emojiContent = this.textContent;

      try {
        await addDoc(collection(db, EMOJI_COLLECTION), {
          showId: showId,
          emoji: emojiContent,
          timestamp: Timestamp.now(),
          pageType: PAGE_TYPE
        });

      } catch (error) {
        console.error("Error adding emoji:", error);
      }
    });
  });

});



// import { db } from "../firebase.js";
// import { 
//   onSnapshot, 
//   collection, 
//   addDoc,
//   doc,
//   updateDoc, 
//   increment,
//   Timestamp 
// } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

// document.addEventListener("DOMContentLoaded", () => {

//   const COLLECTION_NAME = "Mirror-XR-AF26-poll-magical-item";
//   const EMOJI_COLLECTION = "emoji";
//   const PAGE_TYPE = "poll";

//   // const showId = sessionStorage.getItem("showId");
//   const showId = sessionStorage.getItem("showId");
//   let userId = sessionStorage.getItem("userId");

//   if (!userId) {
//     userId = crypto.randomUUID();
//     sessionStorage.setItem("userId", userId);
//   }

//   if (!showId) {
//     window.location.href = "../show-id.html";
//     return;
//   }

//   const username = sessionStorage.getItem("username");
//   const avatar = sessionStorage.getItem("avatar");
//   const avatarBgColor = sessionStorage.getItem("avatarBgColor");
//   const usernameSpan = document.getElementById("chatUsername");
//   const avatarImg = document.getElementById("chatAvatarImg");

//   const avatarWrapper = document.querySelector(".avatar-wrapper");

//   if (avatarWrapper && avatarBgColor) {
//     avatarWrapper.style.backgroundColor = avatarBgColor;
//   }
//   if (usernameSpan && username) usernameSpan.textContent = username;
//   if (avatarImg && avatar) avatarImg.src = avatar;

//   let hasSubmitted = false;
//   let currentLevel = null;

//   /* Listen to admin control document */
//   const controlRef = doc(
//     db,
//     COLLECTION_NAME, showId
//   );
//   const QUESTION_SETS = {

//     Tea: [
//       "Mira, my thoughts keep looping even when I want to relax. How do I make my brain slow down?",
//       "Mira, is it okay if being quiet is how I feel calm, even if other people don’t get it?",
//       "Mira, if mindfulness is like having tea, what happens if I get distracted or mess it up?",
//       "Mira, how is mindfulness not just pretending problems aren’t there?"
//     ],

//     Kintsugi: [
//       "Mira, I can’t stop thinking about my mistakes. How do I stop hating myself for them?",
//       "Mira, what if I don’t want people to see the parts of me that feel broken?",
//       "Mira, if cracks make things more beautiful, does that mean everyone has them, even you?",
//       "Mira, is turning pain into something good actually real, or just something people say?"
//     ],

//     Jar: [
//       "Mira, how do I stop my emotions from piling up in my head all day?",
//       "Mira, what if I don’t know how to explain my feelings out loud?",
//       "Mira, if I put my feelings in a jar, how do I know when it’s okay to open it again?",
//       "Mira, isn’t putting emotions in a jar just avoiding them?"
//     ],

//     Pen: [
//       "Mira, will writing things down actually stop my thoughts from spiralling?",
//       "Mira, what if writing feels easier than talking. Does that still count?",
//       "Mira, if the pen was magical, what would it help me say first?",
//       "Mira, how can writing help if my situation stays the same?"
//     ]
//   };


//   onSnapshot(controlRef, (snapshot) => {

//     const data = snapshot.data();
//     if (!data) return;

//     /* page redirection logic */
//     if (data.currentPage === "chat") {
//       window.location.href = "../mirror-xr-chat/chat.html";
//       return;
//     }

//     if (data.currentPage === "userid") {
//       window.location.href = "../../user-id/user-id.html";
//       return;
//     }

//     if (data.currentPage !== "poll") return;

//     /* EXISTING POLL LOGIC */
//     currentLevel = data.currentPoll;
//     const selectedSet = data.selectedSet;

//     document.querySelectorAll(".poll-container")
//       .forEach(p => p.classList.remove("active"));

//     const pollToShow = document.querySelector(
//       `.poll-container[data-level="${currentLevel}"]`
//     );

//     if (pollToShow) {
//       pollToShow.classList.add("active");
//     }

//     if (selectedSet && ["p2","p3","p4"].includes(currentLevel)) {
//       renderQuestions(selectedSet, currentLevel);
//     }
//     const voted = data.votedUsers?.[currentLevel]?.[userId] || false;
//     hasSubmitted = voted;

//     // Reset UI completely on poll change
//     document.querySelectorAll(".poll-option").forEach(option => {
//       option.classList.remove("selected");

//       const img = option.querySelector("img");
//       if (img && img.dataset.default) {
//         img.src = img.dataset.default;
//       }
//     });

//   });

//   /*Submit vote */
//   async function submitVote(option) {

//     if (!currentLevel || hasSubmitted) return;
//     hasSubmitted = true; 

//     try {
//       const showRef = doc(db, COLLECTION_NAME, showId);

//       await updateDoc(showRef, {
//         [`counts.${currentLevel}.${option}`]: increment(1),
//         [`votedUsers.${currentLevel}.${userId}`]: true
//       });

//     } catch (error) {
//       console.error("Vote error:", error);
//       hasSubmitted = false;
//     }
//   }

//   /* Click handling for 2-column rows */

//   document.addEventListener("click", async (e) => {
//     const optionEl = e.target.closest(".poll-option");
//     if (!optionEl) return;

//     const container = optionEl.closest(".poll-container");
//     if (!container) return;
//     if (!container.classList.contains("active")) return;

//     const option = optionEl.dataset.option;
//     if (!option) return;

//     // Reset all images to default FIRST
//     document.querySelectorAll(".poll-option img").forEach(img => {
//       if (img.dataset.default) {
//         img.src = img.dataset.default;
//       }
//     });

//     // Change clicked image to selected version
//     const img = optionEl.querySelector("img");
//     if (img && img.dataset.selected) {
//       img.src = img.dataset.selected;
//     }

//     optionEl.classList.add("selected");

//     if (hasSubmitted) return;

//     await submitVote(option.toLowerCase());
//   });


//   function renderQuestions(setName, level) {

//     const questions = QUESTION_SETS[setName];
//     if (!questions) return;

//     const activePoll = document.querySelector(
//       `.poll-container[data-level="${level}"]`
//     );

//     if (!activePoll) return;

//     const optionEls = activePoll.querySelectorAll(".poll-option");

//     optionEls.forEach((el, index) => {
//       const textEl = el.querySelector(".option-text");
//       if (textEl) {
//         textEl.textContent = questions[index];
//       }
//     });
//   }

//   document.querySelectorAll('.emoji-button').forEach(button => {
//       button.addEventListener('click', async function() {
//           // // Remove selected class from all buttons
//           // document.querySelectorAll('.emoji-btn').forEach(btn => {
//           //     btn.classList.remove('emoji-selected');
//           // });
          
//           // // Add selected class to clicked button
//           // this.classList.add('emoji-selected');
          
//           // Get emoji index and content
//           const emojiContent = this.textContent;

//           try {
//               // Create data object for Firestore
//               const emojiData = {
//                   showId: showId,
//                   emoji: emojiContent,
//                   timestamp: Timestamp.now(),
//                   pageType: PAGE_TYPE
//               };
              
//               await addDoc(collection(db, EMOJI_COLLECTION), emojiData);
//               // Add document to Firestore
//           } catch (error) {
//               console.error("Error adding emoji to Firestore: ", error);
//           }
//       });
//   });
// });
