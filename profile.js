// ================= FIREBASE =================
import { auth } from "./firebase-config.js";
import {
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ================= ELEMENTS =================
const avatarLarge = document.getElementById("profile-avatar-large");
const nameView = document.getElementById("profile-name-view");
const emailView = document.getElementById("profile-email-view");

const emailInput = document.getElementById("profile-email");
const nameInput = document.getElementById("profile-name");

const editBtn = document.getElementById("edit-btn");
const saveBtn = document.getElementById("save-btn");

// ================= AUTH CHECK =================
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  // VIEW DATA
  nameView.innerText = user.displayName || "User";
  emailView.innerText = user.email;

  // FORM DATA
  emailInput.value = user.email;
  nameInput.value = user.displayName || "";

  // AVATAR
  avatarLarge.innerText =
    (user.displayName || user.email)[0].toUpperCase();
});

// ================= EDIT MODE =================
editBtn.addEventListener("click", () => {
  nameInput.disabled = false;
  saveBtn.disabled = false;

  nameInput.focus();
});

// ================= SAVE PROFILE =================
saveBtn.addEventListener("click", async () => {
  const newName = nameInput.value.trim();

  if (!newName) {
    alert("Name cannot be empty");
    return;
  }

  try {
    await updateProfile(auth.currentUser, {
      displayName: newName
    });

    // UPDATE UI
    nameView.innerText = newName;
    avatarLarge.innerText = newName[0].toUpperCase();

    nameInput.disabled = true;
    saveBtn.disabled = true;

    alert("Profile updated successfully ✅");
  } catch (error) {
    console.error(error);
    alert("Something went wrong ❌");
  }
});
