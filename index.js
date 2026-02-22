import { doc, getDoc } from 
"https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { db } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {

  const inputs = document.querySelectorAll('.show-id input');
  const CURRENT_SHOW_ID = "4230"; // change per show

  inputs.forEach((input, index) => {

    input.dataset.index = index;

    input.addEventListener("input", function () {

      input.value = input.value.replace(/\D/g, "").slice(0, 1);

      if (input.value && index < 3) {
        inputs[index + 1].focus();
      }

      if (index === 3 && input.value) {
        validatePin();
      }

    });

  });

  async function validatePin() {

    let enteredPin = "";

    inputs.forEach(input => {
      enteredPin += input.value;
    });

    if (enteredPin !== CURRENT_SHOW_ID) {
      alert("Please enter the correct PIN");
      inputs.forEach(input => input.value = "");
      inputs[0].focus();
      return;
    }

    const showRef = doc(
      db,
      "Mirror-XR-AF26-poll-magical-item",
      enteredPin
    );

    const snap = await getDoc(showRef);

    if (!snap.exists() || snap.data().active !== true) {
      sessionStorage.clear();
      window.location.replace(
        "https://www.creartdigitalmedia.com.au/fringe-2026"
      );
      return;
    }

      // Save show ID locally
    sessionStorage.setItem("showId", enteredPin);

      // Redirect to avatar selection
    window.location.href = "/user-id/user-id.html";

    }


});
