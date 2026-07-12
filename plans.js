import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc,
    collection,
    addDoc,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

let currentUser = null;

// Check login
onAuthStateChanged(auth, (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;

});

// Investment buttons
const investButtons = document.querySelectorAll(".investBtn");

investButtons.forEach((button) => {

    button.addEventListener("click", async () => {

        try {

            if (!currentUser) {
                alert("Please login first.");
                return;
            }

            const planName = button.dataset.name;
            const amount = Number(button.dataset.amount);
            const dailyProfit = Number(button.dataset.profit);

            // User data
            const userRef = doc(db, "users", currentUser.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                alert("User not found.");
                return;
            }

            const user = userSnap.data();

            // Wallet check
            if (Number(user.balance) < amount) {
                alert("Insufficient wallet balance.");
                return;
            }

            // Active investment check
            const q = query(
                collection(db, "investments"),
                where("userId", "==", currentUser.uid),
                where("status", "==", "Active")
            );

            const activePlans = await getDocs(q);

            if (!activePlans.empty) {
                alert("You already have an active investment. Upgrade feature is coming next.");
                return;
            }

            // Deduct wallet
            await updateDoc(userRef, {
                balance: Number(user.balance) - amount
            });

            // Save investment
            await addDoc(collection(db, "investments"), {
                userId: currentUser.uid,
                email: currentUser.email,
                planName: planName,
                investmentAmount: amount,
                dailyProfit: dailyProfit,
                status: "Active",
                createdAt: new Date().toISOString(),
                totalProfit: 0
            });

            alert("Investment activated successfully!");

            window.location.href = "dashboard.html";

        } catch (error) {

            console.error(error);
            alert(error.message);

        }

    });

});
