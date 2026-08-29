import { db } from "./firebase.js";
import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

const selectionRef = doc(db, "mirror-xr-seeds", "current-session");
const sessionButtons = [...document.querySelectorAll(".seed-session-button")];
const status = document.getElementById("seedSessionStatus");

sessionButtons.forEach(button => button.addEventListener("click", async () => {
  const sessionNumber = Number(button.dataset.session);
  sessionButtons.forEach(item => item.disabled = true);
  status.textContent = "Publishing…";

  try {
    await setDoc(selectionRef, {
      currentSession: sessionNumber,
      updatedAt: serverTimestamp()
    }, { merge: true });
    status.textContent = `Session ${sessionNumber} is live`;
  } catch (error) {
    console.error("Could not publish seed session:", error);
    status.textContent = "Publish failed";
  } finally {
    sessionButtons.forEach(item => item.disabled = false);
  }
}));

onSnapshot(selectionRef, snapshot => {
  if (!snapshot.exists()) {
    status.textContent = "No session selected";
    return;
  }

  const selectedSession = Number(snapshot.data().currentSession);
  sessionButtons.forEach(button => {
    const isActive = Number(button.dataset.session) === selectedSession;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  if (Number.isInteger(selectedSession)) {
    status.textContent = `Session ${selectedSession} is live`;
  }
}, error => {
  console.error("Could not read seed session:", error);
  status.textContent = "Connection error";
});
