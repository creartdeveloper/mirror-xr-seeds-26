import { db } from "../firebase.js";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  const showId = sessionStorage.getItem("showId");

  if (!showId) {
    console.error("No showId found.");
    return;
  }

  const emojiContainer = document.querySelector(".emoji-container");

  const emojiQuery = query(
    collection(db, "emoji"),
    where("showId", "==", showId),
    orderBy("timestamp", "desc")
  );

  onSnapshot(emojiQuery, (snapshot) => {

    snapshot.docChanges().forEach(change => {

      if (change.type === "added") {
        const data = change.doc.data();
        spawnEmoji(data.emoji);
      }

    });

  });

  function spawnEmoji(emoji) {

    const span = document.createElement("span");
    span.className = "floating-emoji";
    span.textContent = emoji;

    // random horizontal position
    span.style.left = Math.random() * 90 + "%";
    span.style.bottom = "0px";

    emojiContainer.appendChild(span);

    setTimeout(() => {
      span.remove();
    }, 4000);
  }

});
