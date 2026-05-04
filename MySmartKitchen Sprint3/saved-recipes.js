// Import Firebase Authentication and Firestore database
import { auth, db } from "./firebase-auth.js";

// Import Firestore functions needed to save data
import { collection, addDoc, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Listen for clicks on the page
document.addEventListener("click", async (e) => {

  // Only run this code if the Save Recipes button was clicked
  if (e.target.id !== "save-recipes-btn") return;

  // Get the currently logged-in user
  const user = auth.currentUser;

  // If no user is logged in, send them to login page
  if (!user) {
    alert("Please log in first to save recipes.");
    window.location.href = "login.html";
    return;
  }

  // Get the generated recipe content from the results area
  const resultsArea = document.getElementById("results-area");
  const recipeHTML = resultsArea.innerHTML;

  try {
    // Save the recipe under the logged-in user's Firestore document
    await addDoc(collection(db, "users", user.uid, "savedRecipes"), {
      recipeHTML: recipeHTML,
      savedAt: serverTimestamp()
    });

    alert("Recipes saved successfully!");

  } catch (error) {
    console.error("Error saving recipes:", error);
    alert("Could not save recipes.");
  }
});
