import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", async () => {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please enter your email and password.");
        return;
    }

    try {

        await signInWithEmailAndPassword(auth, email, password);

        alert("Login successful!");

        window.location.href = "dashboard.html";

    } catch (error) {

        switch (error.code) {

            case "auth/invalid-credential":
                alert("Invalid email or password.");
                break;

            case "auth/user-not-found":
                alert("Account not found.");
                break;

            case "auth/wrong-password":
                alert("Incorrect password.");
                break;

            default:
                alert(error.message);
        }

    }

});
