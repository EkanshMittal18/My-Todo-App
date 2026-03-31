// ================= FIREBASE CORE =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// ================= CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyD96k_SfRzgYsE-lQohwIfNNPB5VG08BfU",
  authDomain: "mytodoapp-71e74.firebaseapp.com",
  databaseURL: "https://mytodoapp-71e74-default-rtdb.firebaseio.com",
  projectId: "mytodoapp-71e74",
  storageBucket: "mytodoapp-71e74.appspot.com",
  messagingSenderId: "890554350978",
  appId: "1:890554350978:web:7193eeef90bfb65a79e39b"
};

// ================= INIT =================
const app = initializeApp(firebaseConfig);

// ================= SERVICES =================
const auth = getAuth(app);
const db = getDatabase(app);

// ================= EXPORT =================
export { auth, db };


