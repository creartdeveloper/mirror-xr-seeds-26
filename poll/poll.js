document.addEventListener("DOMContentLoaded", function() {
    const pollForm = document.getElementById("poll-1"); 
    const optionA = document.getElementById("option-a");
    const optionB = document.getElementById("option-b");
    const optionC = document.getElementById("option-c");
    const optionD = document.getElementById("option-d");    )
    let optionA = 0;
    let optionB = 0; 
    let optionC = 0; 
    let optionD = 0;

    pollForm.addEventListener("submit", function(e){
        //will help prevent the submission of form so following code can execute
        e.preventDefault();
        const formData = new FormData(pollForm);
        const userVote = formData.get("vote");

        if (userVote === "A") {
            optionAVotes ++;            
        } else if (uservote == "B") {
            optionBVotes++;
        }
        updateResults();
    });

    function updateResults() {
        optionA.textCount = optionAVotes;
    }
});