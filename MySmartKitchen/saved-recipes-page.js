// Import Firebase Authentication and Firestore database
import { auth, db } from "./firebase-auth.js";
 
// Import Firestore functions needed to read and delete saved recipes
import { collection, onSnapshot, orderBy, query, deleteDoc, doc }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
 
// Immediately redirect if no user is cached — catches logged-out users before Firebase fully loads
if (!auth.currentUser) {
  alert("Please log in first.");
  window.location.href = "login.html";
}

// If Firebase takes too long to respond, redirect anyway after 3 seconds
const authTimeout = setTimeout(() => {
 
  // Get the status message element and the list container from saved-recipes.html
  const statusEl = document.getElementById("saved-recipes-status");
  const listEl   = document.getElementById("saved-recipes-list");
 
  // Build a Firestore query for this user's saved recipes, newest first
  const recipesQuery = query(
    collection(db, "users", user.uid, "savedRecipes"),
    orderBy("savedAt", "desc")
  );
 
  // Listen for real-time updates from Firestore so new saves and deletes appear instantly
  onSnapshot(recipesQuery, (snapshot) => {
 
    // Hide the loading message once Firestore responds
    statusEl.style.display = "none";
 
    // Clear the list before re-rendering in case recipes were added or removed
    listEl.innerHTML = "";
 
    // If the user has no saved recipes yet, show a friendly message
    if (snapshot.empty) {
      listEl.innerHTML = "<p style='color:#5a7a82;'>No saved recipes yet. Generate some recipes and save them!</p>";
      return;
    }
 
    // Loop through each saved recipe document and inject its HTML into the page
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
 
      // Wrap the stored recipe card HTML in a container div for spacing
      const wrapper = document.createElement("div");
      wrapper.className = "saved-recipe-entry";
      wrapper.innerHTML = data.recipeHTML;
 
      // Create a delete button styled to match the save button on the main page
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "save-recipe-btn add-btn";
      deleteBtn.style.margin = "0 24px 20px";
      deleteBtn.textContent = "Delete This Recipe";
 
      // When the delete button is clicked, remove this recipe from Firestore
      deleteBtn.addEventListener("click", async () => {
        // Show a confirmation so the user doesn't delete by accident
        const confirmed = confirm("Are you sure you want to delete this saved recipe?");
        if (!confirmed) return;
 
        // Disable button while the delete is in progress
        deleteBtn.disabled = true;
        deleteBtn.textContent = "Deleting...";
 
        try {
          // Delete this specific recipe document from the user's Firestore collection
          await deleteDoc(doc(db, "users", user.uid, "savedRecipes", docSnap.id));
          // onSnapshot will automatically re-render the list once Firestore confirms the delete
        } catch (error) {
          // If the delete fails, restore the button so the user can try again
          console.error("Error deleting recipe:", error);
          deleteBtn.disabled = false;
          deleteBtn.textContent = "🗑️ Delete Recipe";
          alert("Could not delete recipe. Please try again.");
        }
      });
 
      // Append the delete button to the bottom of the recipe card, same position as the save button
      const recipeCard = wrapper.querySelector(".recipe-card");
      if (recipeCard) {
        recipeCard.appendChild(deleteBtn);
      } else {
        // Fallback: append to wrapper if card structure isn't found
        wrapper.appendChild(deleteBtn);
      }
 
      // Append the fully built recipe card to the saved recipes list
      listEl.appendChild(wrapper);
    });
 
  }, (error) => {
    // If Firestore fails to load, show an error message instead of a blank page
    console.error("Error loading saved recipes:", error);
    statusEl.textContent = "Could not load saved recipes. Please try again.";
  });
 
});