alert("plans.js loaded");
import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc,
    addDoc,
    collection,
    query,
    where,
    getDocs
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

        try {

            if (!currentUser) {
                alert("Please login first.");
                return;
            }

            const planName = button.dataset.name;
            const amount = Number(button.dataset.amount);
            const dailyProfit = Number(button.dataset.profit);

            const userRef = doc(db, "users", currentUser.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                alert("User not found.");
                return;
            }

            const userData = userSnap.data();

            if (Number(userData.balance) < amount) {
                alert("Insufficient wallet balance.");
                return;
            }

            const investmentQuery = query(
                collection(db, "investments"),
                where("userId", "==", currentUser.uid),
                where("status", "==", "Active")
            );

            const investmentSnapshot = await getDocs(investmentQuery);

            if (!investmentSnapshot.empty) {
                alert("You already have an active investment.");
                return;
            }

            await updateDoc(userRef, {
                balance: Number(userData.balance) - amount
            });

            await addDoc(collection(db, "investments"), {
                userId: currentUser.uid,
                email: currentUser.email,
                planName: planName,
                investmentAmount: amount,
                dailyProfit: dailyProfit,
                status: "Active",
                startDate: new Date().toISOString(),
                lastProfitDate: null
            });

            alert("Investment activated successfully!");

            window.location.href = "dashboard.html";

        } catch (error) {

            alert(error.message);
            console.log(error);

        }

    });

});
