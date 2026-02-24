import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-storage.js";
import { getFirestore, collection, query, orderBy, limit, getDocs, where, addDoc,Timestamp, doc, onSnapshot} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDiCIatzcDsnHdX_t-m15S1a8pNlrB2egs",
    authDomain: "mira-7360b.firebaseapp.com",
    projectId: "mira-7360b",
    storageBucket: "mira-7360b.appspot.com",
    messagingSenderId: "76074103771",
    appId: "1:76074103771:web:1a2d4ca7e8b5df27a82dfe",
    measurementId: "G-9YL8FHBDRX"
};

//intialize
const app = initializeApp(firebaseConfig);

//export count
export const db = getFirestore(app);