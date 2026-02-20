import { db } from "./firebase.js";
import {
  onSnapshot,
  getDoc,
  updateDoc,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  const COLLECTION_NAME = "Mirror-XR-AF26-poll-magical-item";


  let currentShowId = null;
  let currentAudienceSize = 1;
  let unsubscribe = null;

  const ITEM_TO_SET = {
    a: "Tea",
    b: "Kintsugi",
    c: "Jar",
    d: "Pen"
  };

  /* projector display */

  const projectionBtn = document.getElementById("projectionToggle");
  const exitBtn = document.getElementById("exitBtn");

  projectionBtn.addEventListener("click", () => {
    document.body.classList.add("projection-mode");
  });

  exitBtn.addEventListener("click", () => {
    document.body.classList.remove("projection-mode");
  });

  /* load show */

  document.getElementById("loadShow").addEventListener("click", async () => {

    const showInput = document.getElementById("adminShowIdInput").value.trim();
    const audienceInput = document.getElementById("audienceSizeInput").value;

    if (!showInput) {
      alert("Enter a show ID first");
      return;
    }

    if (!audienceInput) {
      alert("Enter audience size before loading show");
      return;
    }

    currentShowId = showInput;
    currentAudienceSize = parseInt(audienceInput);

    const showRef = doc(db, COLLECTION_NAME, currentShowId);

    /* Initialize show document */
    await setDoc(showRef, {
      currentPoll: "p1",
      currentPage: "userid",   //default page
      audienceSize: currentAudienceSize
    }, { merge: true });

    if (unsubscribe) unsubscribe();

    unsubscribe = onSnapshot(showRef, snapshot => {

      const data = snapshot.data();
      if (!data) return;

      const counts = data.counts || {};

      ["p1","p2","p3","p4"].forEach(level => {
        const totals = counts[level] || { a:0,b:0,c:0,d:0 };
        updateUI(totals, level);
      });

      const page = data.currentPage; 
      const poll = data.currentPoll;
      
      document.querySelectorAll(".poll-container")
        .forEach(p => p.classList.remove("active"));

      if (page === "poll" && poll) {
        const activePoll = document.querySelector(
          `.poll-container[data-level="${poll}"]`
        );
        if (activePoll) activePoll.classList.add("active");
      }

      // If chat page selected
      if (page === "chat") {
        document.querySelectorAll(".poll-container")
          .forEach(p => p.classList.remove("active"));
      }
      // if (data.currentPoll) {

      //   document.querySelectorAll(".poll-container").forEach(p => p.classList.remove("active"));
      //   const active = document.querySelector(
      //     `.poll-container[data-level="${data.currentPoll}"]`
      //   );

      //   if (active) active.classList.add("active");
      // }
    });
  });

  console.log("ADMIN SHOW ID:", currentShowId);


  /*update ui */

  function updateUI(totalsRaw, levelId) {

    const totals = {
      a: totalsRaw?.a || 0,
      b: totalsRaw?.b || 0,
      c: totalsRaw?.c || 0,
      d: totalsRaw?.d || 0
    };

    document.getElementById(`count-${levelId}-a`).textContent = totals.a;
    document.getElementById(`count-${levelId}-b`).textContent = totals.b;
    document.getElementById(`count-${levelId}-c`).textContent = totals.c;
    document.getElementById(`count-${levelId}-d`).textContent = totals.d;
  }

  /*reset show */

  document.getElementById("resetShow").addEventListener("click", async () => {

    if (!currentShowId) return;

    const showRef = doc(db, COLLECTION_NAME, currentShowId);

    await setDoc(showRef, {
      currentPoll: "p1",
      currentPage: "userid",
      counts: {},
      votedUsers: {},
      selectedSet: null, 
      poll1Winner: null, 
      poll2Winner: null, 
      poll3Winner: null,
    }, { merge: true });

    alert("Show reset complete");
  });

  async function updatePage(page, poll = null) {

    if (!currentShowId) {
      alert("Load show first");
      return;
    }

    const showRef = doc(db, COLLECTION_NAME, currentShowId);

    const updateData = { currentPage: page };
    if (poll) updateData.currentPoll = poll;

    await updateDoc(showRef, updateData);
  }

  document.getElementById("goToPoll")?.addEventListener("click", () => {
    updatePage("poll", "p1");
  });

  document.getElementById("goToChat")?.addEventListener("click", () => {
    updatePage("chat");
  });

  document.getElementById("startChat")?.addEventListener("click", () => {
    updatePage("chat");
  });

  document.getElementById("goToUserId")?.addEventListener("click", () => {
    updatePage("userid");
  });

  document.getElementById("advanceStory").addEventListener("click", async () => {

      if (!currentShowId) return;

      const showRef = doc(db, COLLECTION_NAME, currentShowId);
      const snapshot = await getDoc(showRef);
      const data = snapshot.data();
      if (!data) return;

      const currentPoll = data.currentPoll;
      const pollCounts = data.counts?.[currentPoll] || {};

      const options = ["a","b","c","d"];

      let max = -1;
      let winners = [];

      options.forEach(opt => {
        const value = pollCounts[opt] || 0;
        if (value > max) {
          max = value;
          winners = [opt];
        } else if (value === max) {
          winners.push(opt);
        }
      });

      const winningOption =
        winners.length === 0
          ? options[Math.floor(Math.random() * options.length)]
          : winners[Math.floor(Math.random() * winners.length)];

      let nextPoll;
      let updateData = {};

      if (currentPoll === "p1") {
        nextPoll = "p2";
        updateData = {
          currentPoll: nextPoll,
          selectedSet: ITEM_TO_SET[winningOption],
          poll1Winner: winningOption
        };

      } else if (currentPoll === "p2") {
        nextPoll = "p3";
        updateData = {
          currentPoll: nextPoll,
          poll2Winner: winningOption
        };

      } else if (currentPoll === "p3") {
        nextPoll = "p4";
        updateData = {
          currentPoll: nextPoll,
          poll3Winner: winningOption
        };

      } else {
        nextPoll = "p2";
        updateData = { currentPoll: nextPoll };
      }

      // Reset next poll counts
      updateData[`counts.${nextPoll}`] = { a:0,b:0,c:0,d:0 };

      await updateDoc(showRef, updateData);
    });
  document.getElementById("backToP1")?.addEventListener("click", () => {
    updatePage("poll", "p1");
  });

  document.getElementById("backToP2")?.addEventListener("click", () => {
    updatePage("poll", "p2");
  });

  document.getElementById("backToP3")?.addEventListener("click", () => {
    updatePage("poll", "p3");
  });

  document.getElementById("backToChat")?.addEventListener("click", () => {
    updatePage("chat");
  });

  document.getElementById("backToUser")?.addEventListener("click", () => {
    updatePage("userid");
  });

  document.getElementById("openFringeBtn")?.addEventListener("click", async () => {

    if (!currentShowId) {
      alert("Load show first");
      return;
    }

    const showRef = doc(db, COLLECTION_NAME, currentShowId);

    await updateDoc(showRef, {
      currentPage: "fringe"
    });

});

});

  /* go from chat page to poll page*/

//     const goToPollBtn = document.getElementById("goToPoll");
//     if (goToPollBtn) {
//       goToPollBtn.addEventListener("click", async () => {

//         if (!currentShowId) {
//           alert("Load show first");
//           return;
//         }

//         const showRef = doc(db, COLLECTION_NAME, currentShowId);

//         await updateDoc(showRef, {
//           currentPage: "poll",
//           currentPoll: "p1"
//         });

//         console.log("Users moved to Poll Page");
//       });
//     }

// /*go from poll page back to chat page*/
//     const goToChatBtn = document.getElementById("goToChat");
//     if (goToChatBtn) {
//       goToChatBtn.addEventListener("click", async () => {

//         if (!currentShowId) return;

//         const showRef = doc(db, COLLECTION_NAME, currentShowId);

//         await updateDoc(showRef, {
//           currentPage: "chat"
//         });

//         console.log("Users moved to Chat Page");
//       });
//     }

//   /* start chat page control */

//   const startChatBtn = document.getElementById("startChat");
//   if (startChatBtn) {
//     startChatBtn.addEventListener("click", async () => {

//       if (!currentShowId) {
//         alert("Load show first");
//         return;
//       }

//       const showRef = doc(db, COLLECTION_NAME, currentShowId);

//       await updateDoc(showRef, {
//         currentPage: "chat"
//       });

//       console.log("Users moved to chat");
//     });
//   }

  /* back to user setup */

  // const goToUserIdBtn = document.getElementById("goToUserId");
  // if (goToUserIdBtn) {
  //   goToUserIdBtn.addEventListener("click", async () => {

  //     if (!currentShowId) return;

  //     const showRef = doc(db, COLLECTION_NAME, currentShowId);

  //     await updateDoc(showRef, {
  //       currentPage: "userid"
  //     });

  //     console.log("Users moved to user setup");
  //   });
  // }

  // /*advance to next poll */

  // document.getElementById("advanceStory").addEventListener("click", async () => {

  //   if (!currentShowId) return;

  //   const showRef = doc(db, COLLECTION_NAME, currentShowId);
  //   const snapshot = await getDoc(showRef);
  //   const data = snapshot.data();

  //   if (!data) return;

  //   const currentPoll = data.currentPoll;
  //   const pollCounts = data.counts?.[currentPoll] || {};

  //   const options = ["a","b","c","d"];

  //   let max = -1;
  //   let winners = [];

  //   options.forEach(opt => {
  //     const value = pollCounts[opt] || 0;
  //     if (value > max) {
  //       max = value;
  //       winners = [opt];
  //     } else if (value === max) {
  //       winners.push(opt);
  //     }
  //   });

  //   let winningOption;

  //   if (winners.length === 0) {
  //     // No votes → random fallback
  //     const options = ["a","b","c","d"];
  //     winningOption = options[Math.floor(Math.random() * options.length)];
  //   } else {
  //     winningOption = winners[Math.floor(Math.random() * winners.length)];
  //   }

  //   let updateData = {};

  //   if (currentPoll === "p1") {

  //     updateData = {
  //       currentPoll: "p2",
  //       selectedSet: ITEM_TO_SET[winningOption],
  //       poll1Winner: winningOption
  //     };

  //   } else if (currentPoll === "p2") {

  //     updateData = {
  //       currentPoll: "p3",
  //       poll2Winner: winningOption
  //     };

  //   } else if (currentPoll === "p3") {

  //     updateData = {
  //       currentPoll: "p4",
  //       poll3Winner: winningOption
  //     };

  //   } else {

  //     updateData = {
  //       currentPoll: "p2"
  //     };

  //   }

  //   await updateDoc(showRef, updateData);
  // });

