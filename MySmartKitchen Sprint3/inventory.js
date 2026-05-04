// Import Firebase Authentication and Firestore database
import { auth, db } from "./firebase-auth.js";

// Import Firestore functions for create, read, and delete
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Check if user is logged in
auth.onAuthStateChanged((user) => {

  // If no user is logged in, redirect to login page
  if (!user) {
    alert("Please log in first.");
    window.location.href = "login.html";
    return;
  }

  // Get the inventory form and table body from inventory.html
  const form = document.getElementById("inventory-form");
  const tableBody = document.getElementById("inventory-table-body");

  // ==============================
  // ADD INVENTORY ITEM
  // ==============================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get user input values
    const itemName = document.getElementById("item-name").value;
    const quantity = document.getElementById("quantity").value;
    const category = document.getElementById("category").value;
    const expiryDate = document.getElementById("expiry-date").value;

    // Save item under this specific user's inventory collection
    await addDoc(collection(db, "users", user.uid, "inventory"), {
      itemName: itemName,
      quantity: quantity,
      category: category,
      expiryDate: expiryDate,
      createdAt: serverTimestamp()
    });

    // Clear the form after saving
    form.reset();
  });

  // ==============================
  // READ INVENTORY ITEMS
  // ==============================
  onSnapshot(collection(db, "users", user.uid, "inventory"), (snapshot) => {

    // Clear table before displaying updated data
    tableBody.innerHTML = "";

    // Loop through every saved inventory item
    snapshot.forEach((itemDoc) => {
      const item = itemDoc.data();

      // Add each item as a row in the table
      tableBody.innerHTML += `
        <tr>
          <td>${item.itemName}</td>
          <td>${item.quantity}</td>
          <td>${item.category}</td>
          <td>${item.expiryDate}</td>
          <td>Saved</td>
          <td>
            <button onclick="deleteInventoryItem('${itemDoc.id}', '${user.uid}')">
              Delete
            </button>
          </td>
        </tr>
      `;
    });
  });
});

// ==============================
// DELETE INVENTORY ITEM
// ==============================
window.deleteInventoryItem = async (itemId, userId) => {

  // Delete selected inventory item from Firestore
  await deleteDoc(doc(db, "users", userId, "inventory", itemId));
};
