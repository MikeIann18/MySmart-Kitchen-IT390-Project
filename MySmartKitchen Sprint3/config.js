//add gemini api key
const GEMINI_API_KEY = ?; 

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
// FIREBASE CONFIG  
const firebaseConfig = {
    apiKey: "AIzaSyCZ5wjHyM5zhLEaJKHVXVadTL1nkVuu3aM",
    authDomain: "mysmartkitchen-aa333.firebaseapp.com",
    projectId: "mysmartkitchen-aa333",
    storageBucket: "mysmartkitchen-aa333.firebasestorage.app",
    messagingSenderId: "456781151739",
    appId: "1:456781151739:web:a56215325e6075bec99f5e"
};
export const app = initializeApp(firebaseConfig);