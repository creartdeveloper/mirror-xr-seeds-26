import { doc, onSnapshot } from  "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { db } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {

  const showId = sessionStorage.getItem("showId");

  // If showId doesn't exist yet, do nothing
  if (!showId) return;

  const currentPage = document.body.dataset.page;
  const showRef = doc(db, "Mirror-XR-AF26-poll-magical-item",showId);

  onSnapshot(showRef, (docSnap) => {

    if (!docSnap.exists()) return;

    const pageType = document.body.dataset.page;
    if (pageType === "landing" || pageType === "profile" || pageType === "userid") return;

    const data = docSnap.data();

    const targetPage = data.currentPage;
    if (targetPage === "fringe") return;
    if (!targetPage) return;

    const currentPage = document.body.dataset.page;
    // If already on correct page, do nothing
    if (currentPage === targetPage) return;

    console.log("Redirecting to:", targetPage);

    // to avoid overrding the landing or userid page
    if (targetPage === "landing" || targetPage =="userid") {
      return;
    }
    
    // Poll folder pages
    if (targetPage === "chat") {
      window.location.href = "/poll/mirror-xr-chat/chat.html";
      return;
    }

    if (targetPage === "poll") {
      window.location.href = "/poll/poll.html";
      return;
    }

  });

});
