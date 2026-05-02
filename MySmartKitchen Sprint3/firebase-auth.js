import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

export const app = initializeApp({
  apiKey: "AIzaSyCZ5wjHyM5zhLEaJKHVXVadTL1nkVuu3aM",
  authDomain: "mysmartkitchen-aa333.firebaseapp.com",
  projectId: "mysmartkitchen-aa333",
  storageBucket: "mysmartkitchen-aa333.firebasestorage.app",
  messagingSenderId: "456781151739",
  appId: "1:456781151739:web:a56215325e6075bec99f5e"
});

const auth = getAuth(app);

// Update the nav login button based on auth state
onAuthStateChanged(auth, (user) => {
  const navLogin = document.querySelector(".nav-login");
  if (!navLogin) return;

  if (user) {
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
    navLogin.innerHTML = `<a href="login.html" class="login-btn">Login</a>`;
  }

  // Show/hide saved recipes section if it exists on the page
  const savedArea = document.getElementById("saved-area");
  if (savedArea) savedArea.style.display = user ? "block" : "none";
});

// Logout handler
window.__firebaseLogout = async () => {
  await signOut(auth);
  window.location.href = "login.html";
};

export { auth };
