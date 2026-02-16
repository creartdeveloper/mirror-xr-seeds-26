import { db } from "../poll/firebase.js";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  deleteDoc,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  const COLLECTION_NAME = "Mirror-XR-AF26-poll-magical-item";

  let currentShowId = null;
  let unsubscribeFunctions = [];
  let currentPollIndex = 1;

  /* load show */

  document.getElementById("loadShow").addEventListener("click", async () => {

    const input = document.getElementById("adminShowIdInput").value.trim();
    if (!input) {
      alert("Enter a show ID first");
      return;
    }

    currentShowId = input;

    // Ensure show doc exists
    await setDoc(
      doc(db, COLLECTION_NAME, "show_" + currentShowId),
      { currentPoll: "p1" },
      { merge: true }
    );

    currentPollIndex = 1;

    startAllPollListeners();
  });

  /* start listeners*/

  function startAllPollListeners() {

    // stop old listeners
    unsubscribeFunctions.forEach(unsub => unsub());
    unsubscribeFunctions = [];

    const levels = ["p1", "p2", "p3", "p4"];

    levels.forEach(levelId => {

      const q = query(
        collection(db, COLLECTION_NAME),
        where("levelId", "==", levelId),
        where("showId", "==", currentShowId)
      );

      const unsubscribe = onSnapshot(q, snapshot => {

        const totals = { a: 0, b: 0, c: 0, d: 0 };

        snapshot.forEach(docSnap => {
          const option = docSnap.data().pollOption?.toLowerCase();
          if (totals[option] !== undefined) {
            totals[option]++;
          }
        });

        updateUI(totals, levelId);

      });

      unsubscribeFunctions.push(unsubscribe);
    });
  }

  /*update ui*/

  function updateUI(totals, levelId) {

    const totalVotes =
      totals.a + totals.b + totals.c + totals.d;

    document.getElementById(`count-${levelId}-a`).textContent = totals.a;
    document.getElementById(`count-${levelId}-b`).textContent = totals.b;
    document.getElementById(`count-${levelId}-c`).textContent = totals.c;
    document.getElementById(`count-${levelId}-d`).textContent = totals.d;

    const percentA = totalVotes ? (totals.a / totalVotes) * 100 : 0;
    const percentB = totalVotes ? (totals.b / totalVotes) * 100 : 0;
    const percentC = totalVotes ? (totals.c / totalVotes) * 100 : 0;
    const percentD = totalVotes ? (totals.d / totalVotes) * 100 : 0;

    document.getElementById(`bar-${levelId}-a`).style.width = percentA + "%";
    document.getElementById(`bar-${levelId}-b`).style.width = percentB + "%";
    document.getElementById(`bar-${levelId}-c`).style.width = percentC + "%";
    document.getElementById(`bar-${levelId}-d`).style.width = percentD + "%";
  }

  /* reset show*/

  document.getElementById("resetShow").addEventListener("click", async () => {

    if (!currentShowId) return;

    const q = query(
      collection(db, COLLECTION_NAME),
      where("showId", "==", currentShowId)
    );

    const snapshot = await getDocs(q);

    const deletePromises = [];
    snapshot.forEach(docSnap => {
      deletePromises.push(deleteDoc(doc(db, COLLECTION_NAME, docSnap.id)));
    });

    await Promise.all(deletePromises);

    // reset to poll 1
    await setDoc(
      doc(db, COLLECTION_NAME, "show_" + currentShowId),
      { currentPoll: "p1" },
      { merge: true }
    );

    currentPollIndex = 1;

    alert("Show reset complete");
  });

  /* story advance*/

  function calculateNextPollLogic() {
    if (currentPollIndex >= 4) return "p4";
    currentPollIndex++;
    return "p" + currentPollIndex;
  }

  document.getElementById("advanceStory").addEventListener("click", async () => {

    if (!currentShowId) return;

    const nextPoll = calculateNextPollLogic();

    await setDoc(
      doc(db, COLLECTION_NAME, "show_" + currentShowId),
      { currentPoll: nextPoll },
      { merge: true }
    );
  });

});
