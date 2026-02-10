
import { db } from "./firebase.js";
import {
  collection,
  doc, 
  setDoc,
  addDoc,
  serverTimestamp,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

document.querySelectorAll('.poll-item').forEach(item => {
  item.addEventListener('click', function() {
    //if item is already selected
    if (this.classList.contains('selected')) {
      return;
    }

    const container = document.querySelector('.items-container');
    const imgElement = this.querySelector('img');
    const selectedItem = this.getAttribute('data-item');

    switch(selectedItem) {
      case 'A':
        imgElement.src = "./assets/P1/S-A.png";
        break;
      case 'B':
        imgElement.src = "./assets/P1/S-B.png";
        break;
      case 'C':
        imgElement.src = "./assets/P1/S-C.png";
        break;
      case 'D':
        imgElement.src = "./assets/P1/S-D.png";
    }
    //store selected item to firebase
    addSelectedItem(selectedItem);
    //hide all other items
    document.querySelectorAll('./poll-item').forEach(otherItem => {
      if (otherItem !== this) {
        otherItem.classList.add('hidden');

      }
    });
    //add selected class to clicked item
    this.classList.add('selected');
    // add single item class to container for centering
    container.classList.add('single-item');
    // store selected item in session 
    sessionStorage.setItem('selectedItem', selectedItem);
    });
});
document.addEventListener("DOMContentLoaded", () => {
  // ID for live show session
  const showId   = sessionStorage.getItem("showId") || "test-show-1";
  //users unique ID
  const userId   = sessionStorage.getItem("userId") || "test-user";
  //users selected username and avatar
  const username = sessionStorage.getItem("username") || "TestUser";
  const avatar   = sessionStorage.getItem("avatar") || "";

  // link polls 1 -4
  const parentPollOption = sessionStorage.getItem("parentPollOption") || null;

  // the poll type defined on each poll page
  const body = document.querySelector("body");
  const levelId = body?.dataset?.level; // p1 / p2 / p3/ p4

  if(!userId || !levelId) {
    console.error("Missing userId or levelId.Redirecting to profile.");
    window.location.href ="../user-id.user-id.html";
    return;
  }

  const poll_flow = {
    p1: "poll2.html",
    p2: "poll3.html",
    p3: "poll4.html",
    p4: null // last poll
  };

  let hasVoted = false;

async function submitVote(pollOption) {
  await addDoc(
    collection(db, "Mirror-XR-AF26-poll-magical-item"),
    {
      showId,
      userId,
      username,
      avatar,
      levelId,
      pollOption,
      parentPollOption,
      timestamp: Timestamp.now()
    }
  );

  sessionStorage.setItem("parentPollOption", pollOption);
}

  //next button 
  const pollButtons = document.querySelectorAll(".poll-item");
  const nextButton = document.getElementById("nextButton");

    //disable next button till vote is made
  if (nextButton) nextButton.disabled = true;

  pollButtons.forEach(button => {
    button.addEventListener("click", async () => {
      if (hasVoted) return; //prevent multiple votes

      pollButtons.forEach(b => b.classList.remove("selected"));
      button.classList.add("selected");

      const pollOption = button.dataset.option?.toLowerCase();
      if (!pollOption) return;

      await submitVote(pollOption);
      hasVoted = true;

      if (nextButton) nextButton.disabled = false;
    });
  });


  if (nextButton) {
    nextButton.addEventListener("click", async (e) => {
      e.preventDefault();

      if (!hasVoted) {
        alert("Please vote first");
        return;
      }

      const nextPage = poll_flow[levelId];
      if (!nextPage) return;

      const nextLevel = nextPage.replace("poll", "p").replace(".html", "");
      try{
        await setDoc(
          doc(db, "shows", showId),
          {
            currentPoll: nextLevel,
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );
      } catch (err) {
        console.warn("Could not update show state:", err.message);
      }
      window.location.href = nextPage;
    });
  }
});