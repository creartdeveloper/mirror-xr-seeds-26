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

  async function switchPoll(newIndex) {

    polls[currentIndex].classList.remove("active");

    currentIndex = newIndex;

    polls[currentIndex].classList.add("active");

    currentPollLevel = polls[currentIndex].dataset.level;

    startListenerForCurrentPoll();

    if (!currentShowId) return;

    await setDoc(
      doc(db, "shows", currentShowId),
      {
        currentPoll: currentPollLevel
      },
      { merge: true }
    );
  }


  /*load the show */

  document.getElementById("loadShow").addEventListener("click",async () => {
    const input = document.getElementById("adminShowIdInput").value.trim();
    if (!input) {
      alert("Enter a show ID first");
      return;
    }

    currentShowId = input;

    document.querySelectorAll(".vote-count").forEach(el => {
      el.textContent = "0";
    });

    document.querySelectorAll(".bar-fill").forEach(bar => {
      bar.style.width = "0%";
    });

    startListenerForCurrentPoll();
  });


/* firestore listener */

  function startListenerForCurrentPoll() {

    if (!currentShowId) return;

    // stop previous listener
    if (activeUnsubscribe) {
      activeUnsubscribe();
      activeUnsubscribe = null;
    }

    const container = polls[currentIndex];
    const levelId = container.dataset.level;

    // reset UI
    const totals = { a: 0, b: 0, c: 0, d: 0 };

    document.getElementById(`count-${levelId}-a`).textContent = 0;
    document.getElementById(`count-${levelId}-b`).textContent = 0;
    document.getElementById(`count-${levelId}-c`).textContent = 0;
    document.getElementById(`count-${levelId}-d`).textContent = 0;

    const q = query(
      collection(db, COLLECTION_NAME),
      where("levelId", "==", levelId),
      where("showId", "==", currentShowId)
    );

    activeUnsubscribe = onSnapshot(q, snapshot => {

      snapshot.docChanges().forEach(change => {

        const option = change.doc.data().pollOption?.toLowerCase();

        if (!totals[option] && totals[option] !== 0) return;

        if (change.type === "added") {
          totals[option]++;
        }

        if (change.type === "removed") {
          totals[option]--;
        }

      });

      updateUI(totals, levelId);

    });
  }


  function updateUI(totals, levelId) {

    const totalVotes =
      totals.a + totals.b + totals.c + totals.d;

    document.getElementById(`count-${levelId}-a`).textContent = totals.a;
    document.getElementById(`count-${levelId}-b`).textContent = totals.b;
    document.getElementById(`count-${levelId}-c`).textContent = totals.c;
    document.getElementById(`count-${levelId}-d`).textContent = totals.d;

    if (totalVotes > 0) {

      const percentA = (totals.a / EXPECTED_AUDIENCE) * 100;
      const percentB = (totals.b / EXPECTED_AUDIENCE) * 100;
      const percentC = (totals.c / EXPECTED_AUDIENCE) * 100;
      const percentD = (totals.d / EXPECTED_AUDIENCE) * 100;

      document.getElementById(`bar-${levelId}-a`).style.width = percentA + "%";
      document.getElementById(`bar-${levelId}-b`).style.width = percentB + "%";
      document.getElementById(`bar-${levelId}-c`).style.width = percentC + "%";
      document.getElementById(`bar-${levelId}-d`).style.width = percentD + "%";
    }
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
