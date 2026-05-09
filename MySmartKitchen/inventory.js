// Import Firebase Authentication and Firestore database
import { auth, db } from "./firebase-auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Import Firestore functions for create, read, and delete
import {
  collection, addDoc, onSnapshot, deleteDoc, doc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Wait for Firebase to confirm login state before deciding to redirect
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Please log in first.");
    window.location.href = "login.html";
    return;
  }

  // Get the inventory form and table body from inventory.html
  const form = document.getElementById("inventory-form");
  const tableBody = document.getElementById("inventory-table-body");

  // Add inventory item when form is submitted
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const itemName = document.getElementById("item-name").value;
    const quantity = document.getElementById("quantity").value;
    const category = document.getElementById("category").value;
    const expiryDate = document.getElementById("expiry-date").value;

    await addDoc(collection(db, "users", user.uid, "inventory"), {
      itemName, quantity, category, expiryDate,
      createdAt: serverTimestamp()
    });
    form.reset();
  });

  // Listen for real-time inventory updates
  onSnapshot(collection(db, "users", user.uid, "inventory"), (snapshot) => {
    tableBody.innerHTML = "";
    snapshot.forEach((itemDoc) => {
      const item = itemDoc.data();
      const today = new Date().toISOString().split("T")[0];
      const isExpired = item.expiryDate && item.expiryDate <= today;
      const rowStyle = isExpired ? "background-color: #ffe5e5; color: #b00020;" : "";
      const dateStyle = isExpired ? "font-weight: 600; color: #b00020;" : "";

      tableBody.innerHTML += `
        <tr style="${rowStyle}">
          <td>${item.itemName}</td>
          <td>${item.quantity}</td>
          <td>${item.category}</td>
          <td style="${dateStyle}">${item.expiryDate}${isExpired ? " ⚠️" : ""}</td>
          <td>Saved</td>
          <td>
            <button onclick="deleteInventoryItem('${itemDoc.id}', '${user.uid}')">Delete</button>
          </td>
        </tr>
      `;
    });
  });
});

// Delete inventory item
window.deleteInventoryItem = async (itemId, userId) => {
  await deleteDoc(doc(db, "users", userId, "inventory", itemId));
};
