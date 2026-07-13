import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    setDoc,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ==============================
// REFERRAL LINK
// ==============================

const referralInput = document.getElementById("referralCode");

const params = new URLSearchParams(window.location.search);

const referralCodeFromURL = params.get("ref");

if (referralCodeFromURL) {

    referralInput.value = referralCodeFromURL;

    referralInput.readOnly = true;

} else {

    alert("Registration is by invitation only.");

    window.location.href = "index.html";

}



// ==============================
// BUTTON
// ==============================

const signupBtn = document.getElementById("signupBtn");

signupBtn.addEventListener("click", registerUser);



// ==============================
// GENERATE REFERRAL CODE
// ==============================

async function generateReferralCode() {

    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let code = "";

    let exists = true;

    while (exists) {

        code = "TOP-";

        for (let i = 0; i < 6; i++) {

            code +=
                characters.charAt(
                    Math.floor(Math.random() * characters.length)
                );

        }

        const q = query(
            collection(db, "users"),
            where("referralCode", "==", code)
        );

        const snapshot = await getDocs(q);

        exists = !snapshot.empty;

    }

    return code;

}



// ==============================
// REGISTER USER
// ==============================

async function registerUser() {

    signupBtn.disabled = true;

    signupBtn.innerText = "Creating Account...";

    try {

        const fullname =
            document.getElementById("fullname").value.trim();

        const email =
            document.getElementById("email")
            .value
            .trim()
            .toLowerCase();

        const password =
            document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const referredBy =
            referralInput.value.trim();



        // ==========================
        // VALIDATION
        // ==========================

        if (
            !fullname ||
            !email ||
            !password ||
            !confirmPassword
        ) {

            throw new Error(
                "Please fill in all required fields."
            );

        }

        if (password.length < 6) {

            throw new Error(
                "Password must be at least 6 characters."
            );

        }

        if (password !== confirmPassword) {

            throw new Error(
                "Passwords do not match."
            );

        }

        if (!referredBy) {

            throw new Error(
                "Referral code is required."
            );

        }



        // ==========================
        // VERIFY REFERRAL CODE
        // ==========================

        const referralQuery = query(
            collection(db, "users"),
            where("referralCode", "==", referredBy)
        );

        const referralSnapshot =
            await getDocs(referralQuery);

        if (referralSnapshot.empty) {

            throw new Error(
                "Invalid referral link."
            );

        }



        // ==========================
        // CREATE ACCOUNT
        // ==========================

        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );



        // ==========================
        // GENERATE USER REFERRAL CODE
        // ==========================

        const myReferralCode =
            await generateReferralCode();



        // ==========================
        // SAVE USER
        // ==========================

        await setDoc(
            doc(db, "users", userCredential.user.uid),
            {

                fullname: fullname,

                email: email,

                balance: 0,

                totalDeposit: 0,

                totalWithdrawal: 0,

                totalProfit: 0,

                referralBonus: 0,

                totalReferrals: 0,

                referralRewardPaid: false,

                referralCode: myReferralCode,

                referredBy: referredBy,

                bankName: "",

                accountNumber: "",

                accountName: "",

                activePlan: null,

                createdAt:
                    new Date().toISOString()

            }
        );



        alert("🎉 Account created successfully!");

        window.location.href = "dashboard.html";

    }

    catch (error) {

        alert(error.message);

    }

    finally {

        signupBtn.disabled = false;

        signupBtn.innerText = "Create Account";

    }

}
