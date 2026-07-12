import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", loginUser);


async function loginUser() {

    loginBtn.disabled = true;
    loginBtn.innerText = "Logging in...";

    try {

        const email = document
            .getElementById("email")
            .value
            .trim()
            .toLowerCase();

        const password = document
            .getElementById("password")
            .value;


        if (!email || !password) {
            throw new Error("Please enter your email and password.");
        }


        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );


        alert("🎉 Login successful!");

        window.location.href = "dashboard.html";

    }

    catch (error) {

        switch (error.code) {

            case "auth/invalid-credential":
                alert("Invalid email or password.");
                break;

            case "auth/user-not-found":
                alert("No account found with this email.");
                break;

            case "auth/wrong-password":
                alert("Incorrect password.");
                break;

            case "auth/invalid-email":
                alert("Please enter a valid email address.");
                break;

            case "auth/too-many-requests":
                alert("Too many failed login attempts. Please try again later.");
                break;

            default:
                alert(error.message);

        }

    }

    finally {

        loginBtn.disabled = false;
        loginBtn.innerText = "Login";

    }

}
