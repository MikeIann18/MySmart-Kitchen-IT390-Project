// Import Firebase Authentication and Firestore database
import { auth, db } from "./firebase-auth.js";

// Import Firestore functions needed to save individual recipe cards
import { collection, addDoc, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Listen for clicks anywhere on the page using event delegation
// This is needed because the save buttons are created dynamically by gemini.js after recipes generate
document.addEventListener("click", async (e) => {

  // Only run if the clicked element is one of the individual save-recipe buttons
  // gemini.js adds a .save-recipe-btn button to the bottom of each recipe card
  if (!e.target.classList.contains("save-recipe-btn")) return;

  // Get the currently logged-in user
  const user = auth.currentUser;

  // If no user is logged in, alert them and redirect to the login page
  if (!user) {
    alert("Please log in first to save recipes.");
    window.location.href = "login.html";
    return;
  }

  // Walk up the DOM to find the recipe card that contains this save button
  const recipeCard = e.target.closest(".recipe-card");
  if (!recipeCard) return;

  // Show saving state while the Firestore write is in progress
  const originalText = e.target.textContent;
  e.target.disabled = true;
  e.target.textContent = "Saving...";

  try {
    // Clone the card so we can strip the save button before storing
    // This prevents the save button from appearing again on the Saved Recipes page
    const cardClone = recipeCard.cloneNode(true);
    cardClone.querySelector(".save-recipe-btn")?.remove();

    // Save only this individual recipe card under the logged-in user's Firestore account
    await addDoc(collection(db, "users", user.uid, "savedRecipes"), {
      recipeHTML: cardClone.outerHTML,
      savedAt: serverTimestamp()
    });

    // Update button to confirm the recipe was saved successfully
    e.target.textContent = "✓ Saved";

  } catch (error) {
    // If the save fails, restore the button so the user can try again
    console.error("Error saving recipe:", error);
    e.target.textContent = originalText;
    e.target.disabled = false;
    alert("Could not save recipe. Please try again.");
  }
});
