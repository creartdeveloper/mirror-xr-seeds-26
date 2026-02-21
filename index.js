document.addEventListener("DOMContentLoaded", () => {

  const inputs = document.querySelectorAll('.show-id input');
  const CURRENT_SHOW_ID = "2310"; // change per show

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

  function validatePin() {

    let enteredPin = "";

    inputs.forEach(input => {
      enteredPin += input.value;
    });

    if (enteredPin === CURRENT_SHOW_ID) {

      // Save show ID locally
      sessionStorage.setItem("showId", enteredPin);

      // Redirect to avatar selection
      window.location.href = "/user-id/user-id.html";

    } else {

      alert("Please enter the correct PIN");

      inputs.forEach(input => input.value = "");
      inputs[0].focus();
    }

  }

});
