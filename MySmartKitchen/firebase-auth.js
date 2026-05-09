// Import Firebase core app initializer
import { initializeApp } 
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

// Import Firebase Authentication functions
import { getAuth, onAuthStateChanged, signOut }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Import Firestore database
import { getFirestore }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Start Firebase using our project settings
export const app = initializeApp({
  apiKey: "AIzaSyCZ5wjHyM5zhLEaJKHVXVadTL1nkVuu3aM",
  authDomain: "mysmartkitchen-aa333.firebaseapp.com",
  projectId: "mysmartkitchen-aa333",
  storageBucket: "mysmartkitchen-aa333.firebasestorage.app",
  messagingSenderId: "456781151739",
  appId: "1:456781151739:web:a56215325e6075bec99f5e"
});

// Create Firebase Authentication object
const auth = getAuth(app);

// Create Firestore database object
const db = getFirestore(app);

// Checks if user is logged in or logged out
onAuthStateChanged(auth, (user) => {
  const navLogin = document.querySelector(".nav-login");
  if (!navLogin) return;

  if (user) {
    // If user is logged in, show their name and logout button
    const displayName = user.displayName || user.email.split("@")[0];

    navLogin.innerHTML = `
      <span style="font-size:0.85rem; color:var(--muted); margin-right:10px;">
        Hi, ${displayName}
      </span>
      <button onclick="window.__firebaseLogout()" class="login-btn"
        style="background:var(--teal-deep); cursor:pointer; border:none;">
        Logout
      </button>
    `;
  } else {
    // If user is not logged in, show login button
    navLogin.innerHTML = `<a href="login.html" class="login-btn">Login</a>`;
  }
});

// Logout function
window.__firebaseLogout = async () => {
  await signOut(auth);
  window.location.href = "login.html";
};

// Export auth and db so other files can use them
export { auth, db };