import { db } from "./firebase.js";
import { collection, query, where, onSnapshot,getDocs,deleteDoc,doc, setDoc, serverTimestamp} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  const COLLECTION_NAME = "Mirror-XR-AF26-poll-magical-item";
  let currentShowId = null;
  let currentPollLevel = null;
  let activeUnsubscribe = null;
  const EXPECTED_AUDIENCE = 200;  
  const polls = document.querySelectorAll(".poll-container");
  let currentIndex = 0;

  polls[currentIndex].classList.add("active");

  /*navigation*/

  document.getElementById("nextPoll").addEventListener("click", () => {
    if (currentIndex < polls.length - 1) {
      switchPoll(currentIndex + 1);
    }
  });

  document.getElementById("backPoll").addEventListener("click", () => {
    if (currentIndex > 0) {
      switchPoll(currentIndex - 1);
    }
  });

  function switchPoll(newIndex) {
    polls[currentIndex].classList.remove("active");
    currentIndex = newIndex;
    polls[currentIndex].classList.add("active");

    currentPollLevel = polls[currentIndex].dataset.level;

    startListenerForCurrentPoll();
  }

  /*load the show */

  document.getElementById("loadShow").addEventListener("click",async () => {
    const input = document.getElementById("adminShowIdInput").value.trim();
    if (!input) {
      alert("Enter a show ID first");
      return;
    }

    currentShowId = input;
    await setDoc(
      doc(db, "shows", currentShowId),
      {
        currentPoll: polls[currentIndex].dataset.level,
        mode: "voting",
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
        document.querySelectorAll(".vote-count").forEach(el => {
      el.textContent = "0";
    });

    document.querySelectorAll(".bar-fill").forEach(bar => {
      bar.style.width = "0%";
    });

    startListenerForCurrentPoll();
  });

  /*firestore listener*/

  function startListenerForCurrentPoll() {

    if (!currentShowId) return;

    if (activeUnsubscribe) {
      activeUnsubscribe();
      activeUnsubscribe = null;
    }

    const container = polls[currentIndex];
    const levelId = container.dataset.level;

    const counters = {
      a: container.querySelector(`#count-${levelId}-a`),
      b: container.querySelector(`#count-${levelId}-b`),
      c: container.querySelector(`#count-${levelId}-c`),
      d: container.querySelector(`#count-${levelId}-d`)
    };

    const bars = {
      a: container.querySelector(`#bar-${levelId}-a`),
      b: container.querySelector(`#bar-${levelId}-b`),
      c: container.querySelector(`#bar-${levelId}-c`),
      d: container.querySelector(`#bar-${levelId}-d`)
    };

    const q = query(
      collection(db, COLLECTION_NAME),
      where("levelId", "==", levelId),
      where("showId", "==", currentShowId)
    );
    activeUnsubscribe = onSnapshot(q, snapshot => {

      const totals = { a: 0, b: 0, c: 0, d: 0 };

      snapshot.forEach(docSnap => {
        const option = docSnap.data().pollOption?.toLowerCase();
        if (totals[option] !== undefined) {
          totals[option]++;
        }
      });

      // Update counts
      counters.a.textContent = totals.a;
      counters.b.textContent = totals.b;
      counters.c.textContent = totals.c;
      counters.d.textContent = totals.d;

      // Update percentage bars
      const totalVotes =
        totals.a + totals.b + totals.c + totals.d;

      if (totalVotes > 0) {
        const percentA = (totals.a / EXPECTED_AUDIENCE) * 100;
        const percentB = (totals.b / EXPECTED_AUDIENCE) * 100;
        const percentC = (totals.c / EXPECTED_AUDIENCE) * 100;
        const percentD = (totals.d / EXPECTED_AUDIENCE) * 100;

        const barA = document.getElementById(`bar-${levelId}-a`);
        const barB = document.getElementById(`bar-${levelId}-b`);
        const barC = document.getElementById(`bar-${levelId}-c`);
        const barD = document.getElementById(`bar-${levelId}-d`);

        if (barA) barA.style.width = percentA + "%";
        if (barB) barB.style.width = percentB + "%";
        if (barC) barC.style.width = percentC + "%";
        if (barD) barD.style.width = percentD + "%";
      }
    });
  }

  /*reset the show */

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

    alert("Show reset complete");
  });

  /*projector mode */

  const projectionBtn = document.getElementById("projectionToggle");

  const exitBtn = document.getElementById("exitBtn");

  projectionBtn.addEventListener("click", () => {
    document.body.classList.toggle("projection-mode");
  });

  /*back to admin button*/

  exitBtn.addEventListener("click", () => {
    document.body.classList.remove("projection-mode");
  });

});
