import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-storage.js";
import { getFirestore, collection, addDoc, getDocs, writeBatch,Timestamp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
    

        const firebaseConfig = {
            apiKey: "AIzaSyDiCIatzcDsnHdX_t-m15S1a8pNlrB2egs",
            authDomain: "mira-7360b.firebaseapp.com",
            projectId: "mira-7360b",
            storageBucket: "mira-7360b.appspot.com",
            messagingSenderId: "76074103771",
            appId: "1:76074103771:web:1a2d4ca7e8b5df27a82dfe",
            measurementId: "G-9YL8FHBDRX"
        };

        const app = initializeApp(firebaseConfig);
        const storage = getStorage(app);
        const db = getFirestore(app);
        const CHAR_MESSAGE_COLLECTION = "chat_box_4";
        const MAGICAL_ITEM_COLLECTION = "magical_item";
        const PAGE_TYPE = "whimsy";
        
        const sendButton = document.querySelector('.pebble-button');
        const textArea = document.querySelector('.msg-text-box');

        sendButton.addEventListener('click', function() {
            const message = textArea.value.trim();
            if (message) {
                addChat(message);
                textArea.value = '';
            }
        });
        
        
        
        
        document.querySelectorAll('.item').forEach(item => {
            item.addEventListener('click', function() {
                // If item is already selected, do nothing
                if (this.classList.contains('selected')) {
                    return;
                }

                const container = document.querySelector('.items-container');
                const imgElement = this.querySelector('img');
                const selectedItem = this.getAttribute('data-item');
                
                // Change image source based on which item was clicked
                switch(selectedItem) {
                    case 'moon':
                        imgElement.src = "UI/Colourful/C 4.1.png";
                        break;
                    case 'book':
                        imgElement.src = "UI/Colourful/C 4.2.png";
                        break;
                    case 'harp':
                        imgElement.src = "UI/Colourful/C 4.3.png";
                        break;
                }
                // Storing the selected item to Firebase;
                addSelectedItem(selectedItem);
                
                // Hide all other items
                document.querySelectorAll('.item').forEach(otherItem => {
                    if (otherItem !== this) {
                        otherItem.classList.add('hidden');
                    }
                });

                // Add selected class to clicked item.
                this.classList.add('selected');
                
                // Add single-item class to container for centering
                container.classList.add('single-item');

                // Store selected item in session
                sessionStorage.setItem('selectedMagicalItem', selectedItem);
            });
        });

        async function addChat(text) {
            try { 
                    
                    // Create a new document with auto-generated ID in the collection
                    const docRef = await addDoc(collection(db, CHAR_MESSAGE_COLLECTION), {
                        device: "ipad-1",
                        message: text,
                        timestamp:Timestamp.now()
                    });

                } catch (e) {
                    console.error("Error adding document: ", e);
                    throw e; // Propagate error to caller
                }
            }


        async function addSelectedItem(item)
        {
            try { 
                    
                    // Create a new document with auto-generated ID in the collection
                    const docRef = await addDoc(collection(db, MAGICAL_ITEM_COLLECTION), {
                        page_type:PAGE_TYPE,
                        item:item,
                        timestamp:Timestamp.now()
                    });

                } catch (e) {
                    console.error("Error adding document: ", e);
                    throw e; // Propagate error to caller
                }
        }    

        // Check if there's a previously selected item on page load
       
  
   