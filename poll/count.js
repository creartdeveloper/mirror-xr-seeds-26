import { db } from "./firebase.js";
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  const COLLECTION_NAME = "Mirror-XR-AF26-poll-magical-item";
  let currentShowId = null;
  let unsubscribeListeners = [];

  const polls = document.querySelectorAll(".poll-container");
  let currentIndex = 0;

  // show first poll visually
  polls[currentIndex].classList.add("active");

  // next button
  document.getElementById("nextPoll").addEventListener("click", () => {
    if (currentIndex < polls.length -1 ){
      polls[currentIndex].classList.remove("active");
      currentIndex++;
      polls[currentIndex].classList.add("active");
    }
  });

  //back button
  document.getElementById("backPoll").addEventListener("click", () => {
    
    if (currentIndex > 0){
      polls[currentIndex].classList.remove("active");
      currentIndex--;
      polls[currentIndex].classList.add("active");
    }
  })


  // load show button
  document.getElementById("loadShow").addEventListener("click", () => {
    const input = document.getElementById("adminShowIdInput").value.trim();

    if (!input) {
      alert("Enter a show ID first");
      return;
    }

    currentShowId = input;

    unsubscribeListeners.forEach(unsub => unsub());
    unsubscribeListeners = [];


    document.querySelectorAll("[id^='count-']").forEach(el => {
      el.textContent = 0;
    });

    startListeners();
  });

  // firestore listens
  function startListeners() {

    // remove old listeners if switching shows
    unsubscribeListeners.forEach(unsub => unsub());
    unsubscribeListeners = [];

    polls.forEach(container => {

      const levelId = container.dataset.level;

      const counters = {
        a: container.querySelector(`#count-${levelId}-a`),
        b: container.querySelector(`#count-${levelId}-b`),
        c: container.querySelector(`#count-${levelId}-c`),
        d: container.querySelector(`#count-${levelId}-d`)
      };

      const q = query(
        collection(db, COLLECTION_NAME),
        where("levelId", "==", levelId),
        where("showId", "==", currentShowId)
      );

      const unsubscribe = onSnapshot(q, snapshot => {

        const totals = { a: 0, b: 0, c: 0, d: 0 };

        snapshot.forEach(doc => {
          const option = doc.data().pollOption?.toLowerCase();
          if (totals[option] !== undefined) {
            totals[option]++;
          }
        });

        counters.a.textContent = totals.a;
        counters.b.textContent = totals.b;
        counters.c.textContent = totals.c;
        counters.d.textContent = totals.d;
      });

      unsubscribeListeners.push(unsubscribe);
    });
  }

  // reset button
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

});
