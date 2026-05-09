// Import Firebase Authentication and Firestore database
import { auth, db } from "./firebase-auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Import Firestore functions needed to read and delete saved recipes
import { collection, onSnapshot, orderBy, query, deleteDoc, doc }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Wait for Firebase to confirm login state before deciding to redirect
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Please log in first.");
    window.location.href = "login.html";
    return;
  }

  // Get the status message element and the list container
  const statusEl = document.getElementById("saved-recipes-status");
  const listEl = document.getElementById("saved-recipes-list");

  // Build a Firestore query for this user's saved recipes, newest first
  const recipesQuery = query(
    collection(db, "users", user.uid, "savedRecipes"),
    orderBy("savedAt", "desc")
  );

  // Listen for real-time updates from Firestore
  onSnapshot(recipesQuery, (snapshot) => {
    statusEl.style.display = "none";
    listEl.innerHTML = "";

    if (snapshot.empty) {
      listEl.innerHTML = "<p style='color:#5a7a82;'>No saved recipes yet. Generate some recipes and save them!</p>";
      return;
    }

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      const wrapper = document.createElement("div");
      wrapper.className = "saved-recipe-entry";
      wrapper.innerHTML = data.recipeHTML;

      // Create a delete button for each saved recipe
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "save-recipe-btn add-btn";
      deleteBtn.style.margin = "0 24px 20px";
      deleteBtn.textContent = "Delete This Recipe";

      deleteBtn.addEventListener("click", async () => {
        const confirmed = confirm("Are you sure you want to delete this saved recipe?");
        if (!confirmed) return;

        deleteBtn.disabled = true;
        deleteBtn.textContent = "Deleting...";

        try {
          await deleteDoc(doc(db, "users", user.uid, "savedRecipes", docSnap.id));
        } catch (error) {
          console.error("Error deleting recipe:", error);
          deleteBtn.disabled = false;
          deleteBtn.textContent = "Delete This Recipe";
          alert("Could not delete recipe. Please try again.");
        }
      });

      const recipeCard = wrapper.querySelector(".recipe-card");
      if (recipeCard) {
        recipeCard.appendChild(deleteBtn);
      } else {
        wrapper.appendChild(deleteBtn);
      }

      listEl.appendChild(wrapper);
    });

  }, (error) => {
    console.error("Error loading saved recipes:", error);
    statusEl.textContent = "Could not load saved recipes. Please try again.";
  });
});
