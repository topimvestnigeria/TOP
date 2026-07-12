import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

let currentUser = null;

onAuthStateChanged(auth, (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;

});

document.querySelectorAll(".investBtn").forEach((button) => {

    button.addEventListener("click", async () => {

        if (!currentUser) {
            alert("Please login first.");
            return;
        }

        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            alert("User not found.");
            return;
        }

        const userData = userSnap.data();

        const planName = button.dataset.name;
        const amount = Number(button.dataset.amount);
        const dailyProfit = Number(button.dataset.profit);

        // Check wallet balance
        if (Number(userData.balance) < amount) {
            alert("Insufficient wallet balance.");
            return;
        }

        // Temporary confirmation
        alert(
            `Plan: ${planName}

Investment: ₦${amount.toLocaleString()}

Daily Profit: ₦${dailyProfit.toLocaleString()}

Wallet Balance: ₦${Number(userData.balance).toLocaleString()}

The investment system will be activated in the next step.`
        );

    });

});
