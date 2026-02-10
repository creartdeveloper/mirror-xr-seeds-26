
document.addEventListener("DOMContentLoaded", () => {
  console.log("Profile page JS loaded");

/*DOM elements*/

  const avatars = document.querySelectorAll(".avatar");
  const selectedAvatarImg = document.getElementById("selectedAvatarImg");
  const defaultAvatarImg = document.getElementById("defaultAvatarimg");
  const usernameInput = document.getElementById("usernameInput");
  const selectedAvatarBox = document.getElementById("selectedAvatarBox");
  const nextButton = document.getElementById("nextButton");

  //if elements are missing 
  if (!avatars.length || !nextButton || !usernameInput || !selectedAvatarBox || !selectedAvatarImg || !defaultAvatarImg) {
    console.error("Critical DOM elements missing");
    return;
  }

  // track whether user selected an avatar
  const hasRealAvatar = sessionStorage.getItem("realAvatarSelected") == "true";


  const defaultAvatars = [
    "assets/default-avatars/Dewdrop.png",
    "assets/default-avatars/Pebble.png",
    "assets/default-avatars/Twinkle.png",
    "assets/default-avatars/Whimsy.png"
  ];

/*color picker*/

  const pickr = Pickr.create({
    el: "#background-color",
    theme: "classic",
    default: sessionStorage.getItem("avatarBgColor") || "#ffffff",
    components: {
      preview: true,
      opacity: false,
      hue: true,
      interaction: {
        hex: true,
        input: true,
        save: true
      }
    }
  });

  pickr.enable();

  pickr.on("save", (color) => {
    const hex = color.toHEXA().toString();
    selectedAvatarBox.style.backgroundColor = hex;
    sessionStorage.setItem("avatarBgColor", hex);
    pickr.hide();
    updateNextButtonState();
  });

  /*restore selected avatar*/

  function restoreSelectedAvatar() {
    if(!hasRealAvatar) return; 

    const savedAvatar = sessionStorage.getItem("selectedAvatar");
    const savedBg = sessionStorage.getItem("avatarBgColor");
    const savedUsername = sessionStorage.getItem("username");

    if (savedAvatar && hasRealAvatar) {
      selectedAvatarImg.src = savedAvatar; 
      selectedAvatarImg.style.display="block";
      defaultAvatarImg.style.display="none";
    }

    if (savedBg) {
      selectedAvatarBox.style.backgroundColor = savedBg;
    }

    if (savedUsername) {
      usernameInput.value = savedUsername; 
      usernameInput.disabled = false; 
      usernameInput.classList.add("enabled");
    }

    pickr.enable();
  }
/*default avatar*/
  function assignDefaultAvatar() {
    if(hasRealAvatar) return;

    const randomAvatar = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];
    
    defaultAvatarImg.src = randomAvatar;
    defaultAvatarImg.style.display = "block";
    selectedAvatarImg.style.display = "none";

    sessionStorage.setItem("avatar", randomAvatar);

    usernameInput.disabled = false;
    usernameInput.classList.add("enabled");
  }
/*username */
  const adjectives = [
    "Bouncy","Zippy","Snappy","Wiggly","Sparkly",
    "Chunky","Fizzy","Speedy","Goofy","Spooky",
    "Flashy","Slinky","Loopy","Cheeky","Buzzy"
  ];

  const nouns = [
    "Orb","Boost","Zap","Token","Pad",
    "Bar","Ring","Beam","Tile","Dash",
    "Loop","Meter","Core","Chip","Pulse"
  ];

  let usernameAssigned = false;

  const getRandomInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const generateUsername = () =>
    adjectives[getRandomInt(0, adjectives.length - 1)] +
    nouns[getRandomInt(0, nouns.length - 1)] +
    getRandomInt(0, 9);

/*avatar selection*/
  avatars.forEach(avatar => {
    avatar.addEventListener("click", () => {
      avatars.forEach(a => a.classList.remove("selected"));
      avatar.classList.add("selected");

      const img = avatar.querySelector("img");
      if (!img) return;

      defaultAvatarImg.style.display = "none";
      selectedAvatarImg.src = img.src;
      selectedAvatarImg.style.display = "block";

      sessionStorage.setItem("selectedAvatar", img.src);
      sessionStorage.setItem("realAvatarSelected", "true");
      sessionStorage.setItem("avatar", img.src);
      sessionStorage.removeItem("isDefaultAvatar");

      pickr.enable();

      //auto generate username once
      if (!usernameAssigned) {
        const name = generateUsername();
        usernameInput.value = name;
        sessionStorage.setItem("username", name);
        usernameAssigned = true;
      }

      updateNextButtonState();
    });
  });
/*username input*/

  usernameInput.addEventListener("input", () => {
    sessionStorage.setItem("username", usernameInput.value.trim());
    updateNextButtonState();
  });
/*next button*/
  nextButton.addEventListener("click", () => {

    //unique id (no two users with same username) to be resued in the next pages + link avatar, username , votes
    if(!sessionStorage.getItem("userId")){
      const userId = crypto.randomUUID();
      sessionStorage.setItem("userId", userId);
    }
    window.location.replace("../poll/poll1.html");
  });
/*button state*/
  function updateNextButtonState() {
    const hasUsername = !!sessionStorage.getItem("username");

    const hasAvatar = 
      sessionStorage.getItem("realAvatarSelected") === "true" ||
      sessionStorage.getItem("isDefaultAvatar") === "true";

      nextButton.disabled = !(hasUsername && hasAvatar);
  }

  restoreSelectedAvatar();
  assignDefaultAvatar();
  updateNextButtonState();
});

