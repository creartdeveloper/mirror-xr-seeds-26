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

  /* projector display */

  const projectionBtn = document.getElementById("projectionToggle");
  const exitBtn = document.getElementById("exitBtn");

  projectionBtn.addEventListener("click", () => {
    document.body.classList.add("projection-mode");
  });

  exitBtn.addEventListener("click", () => {
    document.body.classList.remove("projection-mode");
  });

  /* load the new show */

  document.getElementById("loadShow").addEventListener("click", async () => {

    console.log("LOAD SHOW CLICKED");

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
      audienceSize: currentAudienceSize
    }, { merge: true });

    /* Remove previous listener if exists */
    if (unsubscribe) {
      unsubscribe();
    }

    /* Attach new realtime listener */
    unsubscribe = onSnapshot(showRef, snapshot => {

      const data = snapshot.data();
      if (!data) return;

      const counts = data.counts || {};
      currentAudienceSize = data.audienceSize || 1;

      ["p1","p2","p3","p4"].forEach(level => {
        const totals = counts[level] || { a:0,b:0,c:0,d:0 };
        updateUI(totals, level);
      });

      /* Auto-scroll to active poll */
      if (data.currentPoll) {
        const activeElement = document.querySelector(`[data-level="${data.currentPoll}"]`);
        if (activeElement) {
          activeElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }

    });

  });

  /*update admin poll bar */

  function updateUI(totalsRaw, levelId) {

    const totals = {
      a: totalsRaw?.a || 0,
      b: totalsRaw?.b || 0,
      c: totalsRaw?.c || 0,
      d: totalsRaw?.d || 0
    };

    const audienceSize = currentAudienceSize || 1;

    /* Update vote counts */
    document.getElementById(`count-${levelId}-a`).textContent = totals.a;
    document.getElementById(`count-${levelId}-b`).textContent = totals.b;
    document.getElementById(`count-${levelId}-c`).textContent = totals.c;
    document.getElementById(`count-${levelId}-d`).textContent = totals.d;

    /* Bar percentage relative to full audience */
    const percentA = (totals.a / audienceSize) * 100;
    const percentB = (totals.b / audienceSize) * 100;
    const percentC = (totals.c / audienceSize) * 100;
    const percentD = (totals.d / audienceSize) * 100;

    document.getElementById(`bar-${levelId}-a`).style.width = percentA + "%";
    document.getElementById(`bar-${levelId}-b`).style.width = percentB + "%";
    document.getElementById(`bar-${levelId}-c`).style.width = percentC + "%";
    document.getElementById(`bar-${levelId}-d`).style.width = percentD + "%";
  }

  /*reset show */

  document.getElementById("resetShow").addEventListener("click", async () => {

    if (!currentShowId) return;

    const showRef = doc(db, COLLECTION_NAME, currentShowId);

    await setDoc(showRef, {
      currentPoll: "p1",
      counts: {},
      votedUsers: {}
    }, { merge: true });

    alert("Show reset complete");
  });

  /* advance story button */

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
      winners[Math.floor(Math.random() * winners.length)];

    let nextPoll;
    if (currentPoll === "p1") nextPoll = "p2";
    else if (currentPoll === "p2") nextPoll = "p3";
    else if (currentPoll === "p3") nextPoll = "p4";
    else nextPoll = "p4";

    await updateDoc(showRef, {
      currentPoll: nextPoll,
      parentPollOption: winningOption
    });

  });

});
