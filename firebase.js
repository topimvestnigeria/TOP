// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyATY9siExVCe0snihq75eCzBi4BZ3aj_lU",
  authDomain: "topapp-a6897.firebaseapp.com",
  projectId: "topapp-a6897",
  storageBucket: "topapp-a6897.firebasestorage.app",
  messagingSenderId: "219264849420",
  appId: "1:219264849420:web:4c5b3918e2606041d38029"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
