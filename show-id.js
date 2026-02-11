/* generate showid/pin*/

const inputs = document.querySelectorAll('.show-id pin');
//CHANGE THIS PIN PER SHOW
const CURRENT_SHOW_ID = "1200";

inputs.forEach((input, index) => {
    input.dataset.index = index;

    input.addEventListener("input", function() {
        //allow 1 number per box
        input.value = input.value.replace(/\D/g, "").slice(0, 1);

        if(input.value && index < 3) {
            inputs[index +1].focus();
        }

        if (index === 3 && input.value) {
            validatePin();
        }
    });

});


function validatePin(){
    let enteredPin = "";

    inputs.forEach(input => {
        enteredPin += input.value;
    });

    if (enteredPin === CURRENT_SHOW_ID){
        sessionStorage.setItem("showId", enteredPin);
        window.location.href = "../user-id/user-id.html";
    } else {
        alert("Please enter the correct PIN");

        //clear the boxes
        inputs.forEach(input => input.value = "");
        inputs[0].focus();
    }
}










