import { auth, db } from "./firebase.js";

import {
    addDoc,
    collection
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const depositBtn = document.getElementById("depositBtn");

depositBtn.addEventListener("click", async () => {

    try {

        const user = auth.currentUser;

        if (!user) {
            alert("Please login first.");
            return;
        }

        const amount = Number(document.getElementById("amount").value);
        const method = document.getElementById("method").value;
        const reference = document.getElementById("reference").value.trim();

        if (amount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        if (!reference) {
            alert("Please enter the transaction reference.");
            return;
        }

        await addDoc(collection(db, "depositRequests"), {
            userId: user.uid,
            email: user.email,
            amount: amount,
            method: method,
            reference: reference,
            status: "Pending",
            createdAt: new Date().toISOString()
        });

        document.getElementById("status").innerText =
            "✅ Deposit request submitted successfully.";

        document.getElementById("amount").value = "";
        document.getElementById("reference").value = "";

    } catch (error) {

        console.error(error);
        alert(error.message);

    }

});
