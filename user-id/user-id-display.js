import { db } from "../firebase.js";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  const params = new URLSearchParams(window.location.search);
  const showId = params.get("showId") || params.get("showid");


  console.log("URL:", window.location.href);
  console.log("Extracted showId:", showId);
  if (!showId) {
    console.error("No showId found in URL.");
    return;
  }

  const container = document.getElementById("usersContainer");

  const q = query(
    collection(db, "Mirror-XR-AF26-poll-magical-item",  showId ,"users"),
    orderBy("timestamp", "asc")
  );

    onSnapshot(q, (snapshot) => {

        snapshot.docChanges().forEach((change) => {

            const data = change.doc.data();
            const id = change.doc.id;

            if (change.type === "added") {

                const card = document.createElement("div");
                card.classList.add("user-card");
                card.id = "user-" + id;

                const avatarWrapper = document.createElement("div");
                avatarWrapper.classList.add("user-avatar-wrapper");
                avatarWrapper.style.backgroundColor = data.bgColor || "#ffffff";

                const img = document.createElement("img");
                img.src = data.avatar;

                const name = document.createElement("p");
                name.textContent = data.username;

                avatarWrapper.appendChild(img);
                card.appendChild(avatarWrapper);
                card.appendChild(name);

                container.appendChild(card);
            }

            if (change.type === "removed") {
                const existing = document.getElementById("user-" + id);
                if (existing) existing.remove();
            }

        });

    });
});