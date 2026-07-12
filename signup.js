import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


const signupBtn = document.getElementById("signupBtn");

signupBtn.addEventListener("click", registerUser);


async function registerUser() {

    signupBtn.disabled = true;
    signupBtn.innerText = "Creating Account...";

    try {

        const fullname = document.getElementById("fullname").value.trim();

        const email = document.getElementById("email").value.trim().toLowerCase();

        const password = document.getElementById("password").value;

        const confirmPassword = document.getElementById("confirmPassword").value;

        const referralCodeInput =
            document.getElementById("referralCode")?.value.trim() || "";


        // Validation

        if (!fullname || !email || !password || !confirmPassword) {

            throw new Error("Please fill in all required fields.");

        }


        if (password.length < 6) {

            throw new Error("Password must be at least 6 characters.");

        }


        if (password !== confirmPassword) {

            throw new Error("Passwords do not match.");

        }



        // Create Firebase Account

        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );



        // Save User

        await setDoc(
            doc(db, "users", userCredential.user.uid),
            {

                fullname: fullname,

                email: email,

                balance: 0,

                referralBonus: 0,

                totalProfit: 0,

                totalDeposit: 0,

                totalWithdrawal: 0,

                bankName: "",

                accountNumber: "",

                accountName: "",

                activePlan: null,

                referralCode: userCredential.user.uid.substring(0, 8).toUpperCase(),

                referredBy: referralCodeInput,

                createdAt: new Date().toISOString()

            }
        );


        alert("🎉 Account created successfully!");

        window.location.href = "login.html";

    }

    catch (error) {

        alert(error.message);

    }

    finally {

        signupBtn.disabled = false;

        signupBtn.innerText = "Create Account";

    }

}
