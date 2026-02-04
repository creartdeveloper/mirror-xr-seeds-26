document.addEventListener("DOMContentLoaded", () => {
  const avatarImg = document.getElementById("selectedAvatarImg");
  const avatarWrap = document.querySelector(".avatar-wrap");

  const savedAvatar = sessionStorage.getItem("selectedAvatar");
  const avatarBg = sessionStorage.getItem("avatarBgColor");

  console.log("Avatar from session:", savedAvatar);
  console.log("Avatar BG from session:", avatarBg);

  if (savedAvatar && avatarImg) {
    avatarImg.src = savedAvatar;
    avatarImg.style.display = "block";
  }

  if (avatarBg && avatarWrap) {
    avatarWrap.style.backgroundColor = avatarBg;
  }
});

document.addEventListener("DOMContentLoaded", () => {
    const textArea = document.querySelector(".msg-text-box");
    const pickItemButton = document.querySelector(".pick-item-button");
    const avatarImg = document.getElementById(".emoji-btn");
    const avatarWrap = document.querySelector(".item");

    if(!textArea || !pickItemButton) {
        console.error("required elements missing");
        return;
    }

    function updateSubmitState() {
        const hasMessage = textArea.value.trim().length > 0; 
        const hasEmoji = !!sessionStorage.getItem("selectedEmoji");
        const hasItem = !!sessionStorage.getItem("selectedMagicalItem");

        pickItemButton.disabled = !(hasMessage && hasEmoji && hasItem);

    }

    emojiButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            emojiButtons.forEach(b => b.classList.remove("emoji-selected"));
            btn.classList.add("emoji-selected");

            sessionStorage.setItem("selectedEmoji", btn.textContent);

            updateSubmitState();
        }); 

    });

    magicalItems.forEach(item => {
        item.addEventListener("click", () => {
            if(item.classList.contains("selected")) return; 

            magicalItems.forEach(i => i.classList.remove("selected"));
            items.classList.add("selected");


            sessionStorage.setItem("selectedMagicalItem", selectedItem); 

            updateSubmitState();
       });
    });

    textArea.addEventListener("input", updateSubmitState);


    pickItemButton.addEventListener("click", () => {
        const message = textArea.value.trim();
        const emoji = sessionStorage.getItem("selectedEmoji");
        const item = sessionStorage.getItem("selectedMagicalItem");
        const username = sessionStorage.getItem("username");
        const avatar = sessionStorage.getItem("selectedAvatar");

        if(!message || !emoji || !item) return; 

        console.log("Final submission:", { message, emoji, item, username, avatar});

    textArea.value = "";
    sessionStorage.removeItem("selectedEmoji");
    sessionStorage.removeItem("selectedMagicalItem");
    emojiButtons.forEach(b => b.classList.remove("emoji-selected"));
    magicalItems.forEach(i => i.classList.remove("selected"));
    updateSubmitState();

    });
}); 

