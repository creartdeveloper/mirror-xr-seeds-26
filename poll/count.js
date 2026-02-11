//show id needs to be tracked 
import { db } from "./firebase.js";
import {collection,query,where,onSnapshot} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const COLLECTION_NAME = "Mirror-XR-AF26-poll-magical-item";


  const showId = sessionStorage.getItem("showId") || "test-show-1";
// loop throught all poll sin the admin page
  document.querySelectorAll(".poll-container").forEach(container => {
    //identify  poll container 

    const levelId = container.dataset.level;
    if (!levelId) {
      console.warn("Missing data-level on poll-container");
      return;
    }

    //map dom elements to counts
    const counters = {
      a: container.querySelector(`#count-${levelId}-A`), //save votes fdor option a
      b: container.querySelector(`#count-${levelId}-B`),
      c: container.querySelector(`#count-${levelId}-C`),
      d: container.querySelector(`#count-${levelId}-D`)
    };

    //firestore query .
    const q = query(
        collection(db, COLLECTION_NAME), 
        where("levelId", "==", levelId),
        where("showId", "==", showId)
      );
    
    //listen real time , fire every time a vote is selected 
    //calculate the counts each time with race conditions
    onSnapshot(q, snapshot => {
      const totals = { a: 0, b: 0, c: 0, d: 0 };

      snapshot.forEach(doc => {
        const option = doc.data().pollOption;
        if (totals[option] !== undefined) {
          totals[option]++;
        }
      });
      // update the admin page each time and instantly, no page reload is needed
      counters.a.textContent = totals.a;
      counters.b.textContent = totals.b;
      counters.c.textContent = totals.c;
      counters.d.textContent = totals.d;

    });
  });
});
// const app = initializeApp(firebaseConfig);
        // const storage = getStorage(app);
        // const db = getFirestore(app);
        
        // const MAGICAL_ITEM_COLLECTION = "magical_item";
        // const PAGE_TYPES = ["dewdrop", "twinkle", "pebble", "whimsy"];
        // const EMOJI_COLLECTION = "emoji";

        // const emojiStates = {
        //     dewdrop: { emoji: null, timestamp: null },
        //     twinkle: { emoji: null, timestamp: null },
        //     pebble: { emoji: null, timestamp: null },
        //     whimsy: { emoji: null, timestamp: null }
        // };

        // const pageItems = {
        //     "results-bar1": null,
        //     "results-bar2": null,
        //     "results-bar3": null,
        //     "results-bar4": null
        // };

        // async function loadSelectedItemAndEmoji() {
        //     const currentTime = new Date();

        //     for(let i = 0; i < PAGE_TYPES.length; i++) {
        //         const pageType = PAGE_TYPES[i];
        //         const element = document.getElementById(pageType);
        //         const textSection = element.querySelector('.text-section');
        //         const emojiSection = element.querySelector('.emoji-section');
                
        //         try {
        //             const itemQuery = query(
        //                 collection(db, MAGICAL_ITEM_COLLECTION),
        //                 where("page_type", "==", pageType),
        //                 orderBy("timestamp", "desc"),
        //                 limit(1)  
        //             );

        //             const emojiQuery = query(
        //                 collection(db, EMOJI_COLLECTION),
        //                 where("pageType", "==", pageType),
        //                 orderBy("timestamp", "desc"),
        //                 limit(1)
        //             );

        //             const [itemSnapshot, emojiSnapshot] = await Promise.all([
        //                 getDocs(itemQuery),
        //                 getDocs(emojiQuery)
        //             ]);

        //             // Handle item display
        //             if (!itemSnapshot.empty) {
        //                 const itemData = itemSnapshot.docs[0].data();
        //                 if(pageItems[pageType] || pageItems[pageType] != itemData.item) {
        //                     const displayText = `${pageType}...${itemData.item}....`;
        //                     if (textSection) {
        //                         textSection.textContent = displayText;
        //                     }
        //                 }
        //             }

        //             // Handle emoji display
        //             if (!emojiSnapshot.empty) {
        //                 const emojiData = emojiSnapshot.docs[0].data();
        //                 const newEmojiTimestamp = emojiData.timestamp.toDate();

        //                 if (!emojiStates[pageType].timestamp || 
        //                     newEmojiTimestamp > emojiStates[pageType].timestamp) {
        //                     emojiStates[pageType] = {
        //                         emoji: emojiData.emoji,
        //                         timestamp: newEmojiTimestamp
        //                     };
        //                     if (emojiSection) {
        //                         emojiSection.textContent = emojiData.emoji;
        //                     }
        //                 }
        //             }

        //         } catch (error) {
        //             console.error('Error:', error);
        //         }
        //     }
        // }

        // async function checkAndCleanEmojis() {
        //     const currentTime = new Date();
            
        //     for(let i = 0; i < PAGE_TYPES.length; i++) {
        //         const pageType = PAGE_TYPES[i];
                
        //         if (emojiStates[pageType].timestamp) {
        //             const emojiTime = emojiStates[pageType].timestamp;
        //             const timeDifference = (currentTime - emojiTime);
                    
        //             if (timeDifference >= 12000) {
        //                 //emojiStates[pageType] = { emoji: null, timestamp: null };
        //                 const element = document.getElementById(pageType);
        //                 const emojiSection = element.querySelector('.emoji-section');
                        
        //                 if (emojiSection) {
        //                     emojiSection.textContent = '';
        //                 }
        //             }
        //         }
        //     }
        // }

        // // Start the intervals
        // setInterval(loadSelectedItemAndEmoji, 1000);
        // setInterval(checkAndCleanEmojis, 8000);