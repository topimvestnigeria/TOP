import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

let currentUser = null;

onAuthStateChanged(auth, async (user) => {

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

        console.log(planName);
        console.log(amount);
        console.log(dailyProfit);

        alert(
            `Plan: ${planName}\nInvestment: ₦${amount.toLocaleString()}\nDaily Profit: ₦${dailyProfit.toLocaleString()}`
        );

    });

});
