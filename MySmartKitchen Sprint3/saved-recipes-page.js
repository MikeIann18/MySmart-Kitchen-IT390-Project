// Import Firebase Authentication and Firestore database
import { auth, db } from "./firebase-auth.js";

// Import Firestore functions needed to read and delete saved recipes
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Listen for login state changes
auth.onAuthStateChanged((user) => {

  // Get page elements
  const status = document.getElementById("saved-recipes-status");
  const list = document.getElementById("saved-recipes-list");

  // If user is not logged in, send them to login page
  if (!user) {
    alert("Please log in first to view saved recipes.");
    window.location.href = "login.html";
    return;
  }

  // Create a query to get this user's saved recipes
  // It reads from: users / userId / savedRecipes
  const savedRecipesQuery = query(
    collection(db, "users", user.uid, "savedRecipes"),
    orderBy("savedAt", "desc")
  );

  // Listen for real-time updates from Firestore
  onSnapshot(savedRecipesQuery, (snapshot) => {

    // Clear old content before displaying updated recipes
    list.innerHTML = "";

    // If user has no saved recipes, show message
    if (snapshot.empty) {
      status.textContent = "You have not saved any recipes yet.";
      return;
    }

    // Hide loading/status message once recipes exist
    status.textContent = "";

    // Loop through each saved recipe document
    snapshot.forEach((recipeDoc) => {

      // Get saved recipe data
      const recipe = recipeDoc.data();

      // Create a container for each saved recipe
      const recipeCard = document.createElement("div");
      recipeCard.className = "recipe-card";

      // Display the saved recipe HTML and add delete button
      recipeCard.innerHTML = `
        <div class="recipe-body">
          ${recipe.recipeHTML}
        </div>

        <div style="padding: 0 24px 20px;">
          <button class="add-btn" onclick="deleteSavedRecipe('${recipeDoc.id}', '${user.uid}')">
            Delete Saved Recipe
          </button>
        </div>
      `;

      // Add recipe card to the page
      list.appendChild(recipeCard);
    });
  });
});

// Delete saved recipe function
// Attached to window so the button onclick can access it
window.deleteSavedRecipe = async (recipeId, userId) => {

  // Ask user before deleting
  const confirmDelete = confirm("Are you sure you want to delete this saved recipe?");

  if (!confirmDelete) return;

  // Delete selected saved recipe from Firestore
  await deleteDoc(doc(db, "users", userId, "savedRecipes", recipeId));
};
