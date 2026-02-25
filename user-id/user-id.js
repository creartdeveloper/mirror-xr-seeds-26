import { doc, onSnapshot, setDoc, getDoc } from 
"https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { db } from "../firebase.js";

document.addEventListener("DOMContentLoaded", async () => {
  
  const showId = sessionStorage.getItem("showId");


    if (!showId) {
      window.location.replace(
        "https://www.creartdigitalmedia.com.au/fringe-2026"
      );
      return;
    }
    const showRef = doc(
      db,
      "Mirror-XR-AF26-poll-magical-item",
      showId  
    );
    const snap = await getDoc(showRef);

    if (!snap.exists() || snap.data().active !== true) {
      sessionStorage.clear();
      window.location.replace(
        "https://www.creartdigitalmedia.com.au/fringe-2026"
      );
      return;
    }

    onSnapshot(showRef, (docSnap) => {

      if (!docSnap.exists()) return;

      const data = docSnap.data();
      if (data.active === false) {
        sessionStorage.clear();
        window.location.replace(
          "https://www.creartdigitalmedia.com.au/fringe-2026"
        );
        return;
      }

      if (data.currentPage === "chat") {

        const currentPath = window.location.pathname;

        if (!currentPath.includes("chat.html")) {
          window.location.href = "../poll/mirror-xr-chat/chat.html";
        }

    }

  });

  // console.log("Profile page JS loaded");

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

pickr.on('change', (color) => {
    const selectedColor = color.toHEXA().toString();

    const selectedAvatar = document.querySelector('.selected-avatar');

    if (selectedAvatar) {
        selectedAvatar.style.backgroundColor = selectedColor; 
    }
    sessionStorage.setItem("avatarBgColor", selectedColor);
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

      sessionStorage.setItem("avatar", savedAvatar);
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
    sessionStorage.setItem("isDefaultAvatar", "true");


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

  const colorInput = document.getElementById("background-color");
  const swatchPreview = document.querySelector(".swatch-preview");

  if (colorInput && swatchPreview) {
      swatchPreview.style.background = colorInput.value;

      colorInput.addEventListener("input", () => {
          swatchPreview.style.background = colorInput.value;
      });
  }
/*username input*/

  usernameInput.addEventListener("input", () => {
    sessionStorage.setItem("username", usernameInput.value.trim());
    usernameInput.value = usernameInput.value.replace(/[^a-zA-Z0-9]/g, "");
    updateNextButtonState();
  });

/* next button */
  nextButton.addEventListener("click", async () => {

    const finalUsername = usernameInput.value.trim();
    const finalAvatar = sessionStorage.getItem("avatar");
    const finalBgColor = sessionStorage.getItem("avatarBgColor");

    const userId = sessionStorage.getItem("userId") || crypto.randomUUID();
    sessionStorage.setItem("userId", userId);

    if (!showId) {
      console.error("No showId found");
      return;
    }

    // SHOW OVERLAY IMMEDIATELY
    document.getElementById("waitingOverlay").style.display = "flex";

    nextButton.disabled = true;

    await setDoc(
      doc(db, "Mirror-XR-AF26-poll-magical-item", showId, "users", userId),
      {
        username: finalUsername,
        avatar: finalAvatar,
        avataBgColor: finalBgColor,
        timestamp: Date.now()
      }
    );

  });
/*button state*/
  function updateNextButtonState() {
    // read username from sessionstorage and if username is null -> "" and trim (remove spaces from start and end)
    const name = (sessionStorage.getItem("username") || "").trim();
    const hasUsername = name.length >=2 && name.length <=15; // atleast 2 char and <15 char

    const hasAvatar = 
      sessionStorage.getItem("realAvatarSelected") === "true" ||

      sessionStorage.getItem("isDefaultAvatar") === "true";

      nextButton.disabled = !(hasUsername && hasAvatar);
  }

  restoreSelectedAvatar();
  assignDefaultAvatar();
  updateNextButtonState();
});

