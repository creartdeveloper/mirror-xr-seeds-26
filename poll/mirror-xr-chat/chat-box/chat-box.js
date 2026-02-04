
// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getFirestore, collection, query, orderBy, limit, getDocs,deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDiCIatzcDsnHdX_t-m15S1a8pNlrB2egs",
    authDomain: "mira-7360b.firebaseapp.com",
    projectId: "mira-7360b",
    storageBucket: "mira-7360b.appspot.com",
    messagingSenderId: "76074103771",
    appId: "1:76074103771:web:1a2d4ca7e8b5df27a82dfe",
    measurementId: "G-9YL8FHBDRX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
let timestamp ;
let lastUpdates=[];
const displayUpdateTimes = {};
const CHATBOXES=6;

// Constants that don't need to be recreated
const imageObject = {
    'dewdrop': '../assets/chat-boxes/Resolume-IU-Dewdrop-M.gif',
    'whimsy': '../assets/chat-boxes/Resolume-IU-Whimsy-M.gif',
    'pebble': '../assets/chat-boxes/Resolume-IU-Pebble-M.gif',
    'twinkle': '../assets/chat-boxes/Resolume-IU-Twinkle-M.gif'
};

const chatBoxToType = {
    'chat_box_1': 'dewdrop',
    'chat_box_2': 'pebble',
    'chat_box_3': 'twinkle',
    'chat_box_4': 'whimsy'
};

const collections = ['chat_box_1', 'chat_box_2', 'chat_box_3', 'chat_box_4'];

let timestamps = {
    'dewdrop': 0,
    'twinkle': 0,
    'pebble': 0,
    'whimsy': 0
};

// Function to get an invisible display
function getInvisibleDisplay() {
    const availableDisplays = [];
    const visibleDisplays = new Set();
    
    // First find all visible displays
    for (let i = 1; i <= CHATBOXES; i++) {
        const display = document.getElementById(`text-display-${i}`);
        if (display && display.style.opacity !== "0") {
            visibleDisplays.add(i);
        }
    }
    
    // Then find invisible displays that aren't adjacent to visible ones
    for (let i = 1; i <= CHATBOXES; i++) {
        const display = document.getElementById(`text-display-${i}`);
        if (display && display.style.opacity === "0") {
            // Check if this display is not adjacent to any visible display
            // For a 4x4 grid, adjacent positions would be i-4, i+4 (above/below)
            // and i-1, i+1 (left/right) if not at grid edges
            const isNotAdjacent = ![i-4, i+4, i-1, i+1].some(pos => visibleDisplays.has(pos));
            if (isNotAdjacent) {
                availableDisplays.push(i);
            }
        }
    }
    
    if (availableDisplays.length === 0) {
        // If no non-adjacent spots, fall back to any invisible display
        for (let i = 1; i <= CHATBOXES; i++) {
            const display = document.getElementById(`text-display-${i}`);
            if (display && display.style.opacity === "0") {
                availableDisplays.push(i);
            }
        }
    }
    
    if (availableDisplays.length === 0) return null;
    return availableDisplays[Math.floor(Math.random() * availableDisplays.length)];
}

// Function to fetch latest message from a collection
async function getLatestMessage(collectionName) {
    try {
        const q = query(
            collection(db, collectionName),
            orderBy("timestamp", "desc"),
            limit(1)
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data();
            return [data.message, data.timestamp];
        }
        return [null, null];
    } catch (error) {
        console.error('Error fetching message:', error);
        return [null, null];
    }
}

// Function to update a single display
async function updateDisplay(collection, index) {
    try {
        const [message, timestamp_] = await getLatestMessage(collection);
        if (!message) return;

        const imgType = chatBoxToType[collection];
        if (timestamps[imgType] === timestamp_.seconds) return;

        const displayNumber = getInvisibleDisplay();
        if (displayNumber === null) return;

        const textElement = document.getElementById(`text-${displayNumber}`);
        const textDisplay = document.getElementById(`text-display-${displayNumber}`);

        textDisplay.style.backgroundImage = `url('${imageObject[imgType]}')`;
        textElement.textContent = message;
        textDisplay.style.opacity = "1";
        textDisplay.style.transition = "opacity 0.8s ease-in-out";
        timestamps[imgType] = timestamp_.seconds;

        // Set timeout to clear this display after 12 seconds
        setTimeout(() => {
            textDisplay.style.opacity = "0";
        }, 10000);
    } catch (error) {
        console.error('Error updating display:', error);
    }
}

// Main update function
async function updateAllTextBoxes() {
    const updatePromises = collections.map((collection, index) => 
        new Promise(resolve => {
            setTimeout(() => {
                updateDisplay(collection, index).then(resolve);
            }, index * 300);  // 300ms delay between each
        })
    );
    await Promise.all(updatePromises);
}

// Initialize displays
function createTextDisplays() {
    const container = document.querySelector('.chat-container');
    for (let i = 1; i <= CHATBOXES; i++) {
        const displayDiv = document.createElement('div');
        displayDiv.id = `text-display-${i}`;
        displayDiv.className = 'text-display';
        displayDiv.style.opacity = "0";
        
        const contentDiv = document.createElement('div');
        contentDiv.id = `text-${i}`;
        contentDiv.className = 'text-content';
        
        displayDiv.appendChild(contentDiv);
        container.appendChild(displayDiv);
    }
}
async function clearAllCollections() {
    const collections = ['chat_box_1', 'chat_box_2', 'chat_box_3', 'chat_box_4'];
    
    for (const collectionName of collections) {
        try {
            const q = query(collection(db, collectionName));
            const snapshot = await getDocs(q);
            
            // Delete each document in the collection
            const deletePromises = snapshot.docs.map(doc => 
                deleteDoc(doc.ref)
            );
            
            await Promise.all(deletePromises);
            console.log(`Cleared collection: ${collectionName}`);
        } catch (error) {
            console.error(`Error clearing ${collectionName}:`, error);
        }
    }
}

// Call this when page loads
window.addEventListener('load', clearAllCollections);

// Initialize and start updates
createTextDisplays();
updateAllTextBoxes();
setInterval(updateAllTextBoxes, 1000);