document.addEventListener("DOMContentLoaded", () => {

    const username = sessionStorage.getItem("username");
    const avatar = sessionStorage.getItem("avatar");
    const bgColor = sessionStorage.getItem("backgroundColor");

    const avatarImg = document.getElementById("previewAvatar");
    const usernameText = document.getElementById("previewUsername");

    if (username) {
        usernameText.textContent = username;
    }

    if (avatar) {
        avatarImg.src = avatar;
    }

    if (bgColor) {
        document.body.style.background = bgColor;
    }

});