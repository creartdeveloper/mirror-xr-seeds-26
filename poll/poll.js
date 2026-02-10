
import { db } from "./firebase.js";
import {
  collection,
  doc, 
  setDoc,
  addDoc,
  serverTimestamp,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("poll.js is running");
  // load avatar
  const avatar = sessionStorage.getItem("avatar");
  const avatarImg = document.getElementById("chatAvatarImg");
  
  if (avatar && avatarImg) {
    avatarImg.src = avatar; 
    avatarImg.style.display = "block";
  }
  
  //session data
  // ID for live show session
  const showId   = sessionStorage.getItem("showId") || "test-show-1";
  //users unique ID
  const userId   = sessionStorage.getItem("userId");
  //users selected username and avatar
  const username = sessionStorage.getItem("username") || "TestUser";
  const levelId   = document.body.dataset.level;

  if(!userId || !levelId) {
    console.error("Missing userId or levelId.Redirecting to profile.");
    window.location.href ="../user-id/user-id.html";
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
        timestamp: Timestamp.now()
      }
    );

    sessionStorage.setItem("parentPollOption", pollOption);
  }

  //next button 
  const pollButtons = document.querySelectorAll(".poll-item");
  const containers = document.querySelector(".poll-bars");
  const nextButton = document.getElementById("nextButton");

    //disable next button till vote is made
  if (nextButton) nextButton.disabled = true;

  pollButtons.forEach(button => {
    button.addEventListener("click", async () => {
      if (hasVoted) return; //prevent multiple votes

      const option = button.dataset.option; 
      if(!option) return;

      //swap image from a.png to s-a.png
      const img = button.querySelector("img");
      img.src = `./assets/P1/S-${option}.png`;
      //selected
      button.classList.add("selected");
      //submit and save the vote
      await submitVote(option);
      hasVoted = true;

      //enable the next button
      if (nextButton) nextButton.disabled = false;
    });
  });


  if (nextButton) {
    nextButton.addEventListener("click", async (e) => {
      e.preventDefault();

      if (!hasVoted) return;

      const nextPage = poll_flow[levelId];
      if (!nextPage) return;

      const nextLevel = nextPage.replace("poll", "p").replace(".html", "");

      try {
        await setDoc(
          doc(db, "shows", showId),
          {
            currentPoll: nextLevel,
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );
      } catch (err) {
        console.warn(err.message);
      }

      window.location.href = nextPage;
    });
  }
});