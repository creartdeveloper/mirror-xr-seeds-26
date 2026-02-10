
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
  // console.log("poll.js is running");
  const polls=[
    {
      pollId:"P1", 
      type:"image",
      assetPath:"./assets/P1", 
      questionImage:"./assets/poll-components/Pick-a-Magical-Item.png",
      options:["A", "B", "C", "D"], 
      duration: 30
    },
    // {
    //   pollId :"p2", 
    //   type: "list",
    //   question:"",
    //   options:[,],
    //   duration: 30
    // }
  ];
  // load avatar
  const avatar = sessionStorage.getItem("selectedAvatar");
  const avatarImg = document.getElementById("chatAvatarImg");
  
  if (avatar && avatarImg) {
    avatarImg.src = avatar; 
    avatarImg.style.display = "block";
  }
  
  const username = sessionStorage.getItem("username");
  const usernameSpan = document.getElementById("chatUsername");

  if (username && usernameSpan) {
    usernameSpan.textContent = username;
  }
  //session data
  // ID for live show session
  const showId   = sessionStorage.getItem("showId") || "test-show-1";
  //users unique ID
  const userId   = sessionStorage.getItem("userId");
  let currentPollIndex = 0; 
  let selectedOption = null;


  async function submitVote(pollOption) {
    //add new document row to firestore collection
    //each document represents one vote from one user
    await addDoc(
      collection(db, "Mirror-XR-AF26-poll-magical-item"),
      {
        //live shows the vote belongs to 
        showId,
        //unique identifier for voting user
        userId,
        username,
        avatar,
        //poll this votes for and replaces seperate HTML page
        pollId: polls[currentPollIndex].pollId,
        //poll answer selected
        pollOption,
        timestamp: Timestamp.now()
      }
    );

    sessionStorage.setItem("parentPollOption", pollOption);
  }

  //next button 
  const nextButton = document.getElementById("nextButton");

    //disable next button till vote is made
  if (nextButton) nextButton.disabled = true;



  if (nextButton) {
    nextButton.addEventListener("click", async (e) => {
      e.preventDefault();

      if (!selectedOption) {
        alert("Please pick a magical item ✨");
        return;
      }

      await submitVote(selectedOption);

      currentPollIndex++;


      if (currentPollIndex >= polls.length) {
        console.log("Poll flow finished");
        return;
      }
    });
  }

  function loadPoll() {
    const poll = polls[currentPollIndex];
    const container = document.getElementById("pollOptions");

    selectedOption = null;
    nextButton.disabled = true;
    container.innerHTML = "";

    // show magical item header image
    const headerImg = document.querySelector(".pick-a-magical-item-image");
    if (headerImg && poll.questionImage) {
      headerImg.src = poll.questionImage;
      headerImg.style.display = "block";
    }

    // render magical item images (A–D)
    poll.options.forEach(option => {
      const button = document.createElement("button");
      button.className = "poll-item";
      button.dataset.option = option;

      const img = document.createElement("img");
      img.src = `${poll.assetPath}/${option}.png`;
      img.alt = option;

      button.appendChild(img);

      button.addEventListener("click", () => {
        // reset all images
        document.querySelectorAll(".poll-item img").forEach(i => {
          const opt = i.alt;
          i.src = `${poll.assetPath}/${opt}.png`;
        });

        // mark selected
        img.src = `${poll.assetPath}/S-${option}.png`;
        selectedOption = option;
        nextButton.disabled = false;
      });

      container.appendChild(button);
    });
  }


  loadPoll();
});