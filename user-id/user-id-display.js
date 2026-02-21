import { db } from "../firebase.js";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  const showId = sessionStorage.getItem("showId");

  if (!showId) {
    console.error("No showId found on projector.");
    return;
  }

  const avatarImg = document.getElementById("previewAvatar");
  const usernameText = document.getElementById("previewUsername");

  const q = query(
    collection(db, "Mirror-XR-AF26-poll-magical-item", showId, "users"),
    orderBy("timestamp", "desc")
  );

  onSnapshot(q, (snapshot) => {

    snapshot.docChanges().forEach((change) => {

      if (change.type === "added") {

        const data = change.doc.data();

        if (avatarImg) avatarImg.src = data.avatar;
        if (usernameText) usernameText.textContent = data.username;
        if (data.bgColor) document.body.style.background = data.bgColor;

      }

    });

  });

});