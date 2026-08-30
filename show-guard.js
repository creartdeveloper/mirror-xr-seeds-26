// show-guard.js
import { doc, getDoc } from 
"https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { db } from "./firebase.js";

export async function validateShow(showId) {

  if (!showId) {
    window.location.href = "/ended.html";
    return;
  }

  const showRef = doc(db, "mirror-xr-seeds", showId);
  const snap = await getDoc(showRef);

  if (!snap.exists()) {
    window.location.href = "/ended.html";
    return;
  }

  const data = snap.data();

  if (!data.isActive) {
    window.location.href = "/ended.html";
  }
}