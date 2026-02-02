document.addEventListener("DOMContentLoaded", () => {
  console.log("Profile page JS loaded");

  const avatars = document.querySelectorAll(".avatar");
  const selectedAvatarImg = document.getElementById("selectedAvatarImg");
  const defaultAvatarImg = document.getElementById("defaultAvatarimg");
  const usernameInput = document.getElementById("usernameInput");
  const selectedAvatar = document.querySelector(".selected-avatar");
  const nextButton = document.getElementById("nextButton");

  if (!avatars.length || !nextButton || !usernameInput || !selectedAvatar) {
    console.error("Critical DOM elements missing");
    return;
  }


  const defaultAvatars = [
    "../images/iPad-IU-Dewdrop.png",
    "../images/iPad-IU-Pebble.png",
    "../images/iPad-IU-Twinkle.png",
    "../images/iPad-IU-Whimsy.png"
  ];

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

  pickr.disable();

  pickr.on("save", (color) => {
    const hex = color.toHEXA().toString();
    selectedAvatar.style.backgroundColor = hex;
    sessionStorage.setItem("avatarBgColor", hex);
    pickr.hide();
    updateNextButtonState();
  });

  function assignDefaultAvatar() {
    if (!sessionStorage.getItem("realAvatarSelected")) {
      const randomAvatar =
        defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

      defaultAvatarImg.src = randomAvatar;
      defaultAvatarImg.style.display = "block";
      selectedAvatarImg.style.display = "none";

      sessionStorage.setItem("isDefaultAvatar", "true");

      usernameInput.disabled = false;
      usernameInput.classList.add("enabled");
    }
  }


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
      sessionStorage.removeItem("isDefaultAvatar");

      pickr.enable();

      if (!usernameAssigned) {
        const name = generateUsername();
        usernameInput.value = name;
        sessionStorage.setItem("username", name);
        usernameAssigned = true;
      }

      updateNextButtonState();
    });
  });

  usernameInput.addEventListener("input", () => {
    sessionStorage.setItem("username", usernameInput.value.trim());
    updateNextButtonState();
  });

  nextButton.addEventListener("click", () => {
    window.location.href = "../Chat/chat.html";
  });

  function updateNextButtonState() {
    const hasUsername = !!sessionStorage.getItem("username");
    const hasBg = sessionStorage.getItem("isDefaultAvatar")
      ? true
      : !!sessionStorage.getItem("avatarBgColor");

    nextButton.disabled = !(hasUsername && hasBg);
  }

  assignDefaultAvatar();
  updateNextButtonState();
});
