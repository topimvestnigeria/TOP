import { auth, db } from "./firebase.js";

import {
    addDoc,
    collection
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


const withdrawBtn = document.getElementById("withdrawBtn");


withdrawBtn.addEventListener("click", async () => {

    try {

        const user = auth.currentUser;

        if (!user) {
            alert("Please login first.");
            return;
        }


        const amount = Number(
            document.getElementById("amount").value
        );

        const bank = document.getElementById("bank").value.trim();

        const accountNumber =
            document.getElementById("accountNumber").value.trim();

        const accountName =
            document.getElementById("accountName").value.trim();


        if (
            amount <= 0 ||
            !bank ||
            !accountNumber ||
            !accountName
        ) {
            alert("Please complete all fields.");
            return;
        }


        await addDoc(collection(db, "withdrawRequests"), {

            userId: user.uid,

            email: user.email,

            amount: amount,

            bank: bank,

            accountNumber: accountNumber,

            accountName: accountName,

            status: "Pending",

            createdAt: new Date().toISOString()

        });


        document.getElementById("status").innerText =
            "✅ Withdrawal request submitted successfully!";


        // Clear form
        document.getElementById("amount").value = "";
        document.getElementById("bank").value = "";
        document.getElementById("accountNumber").value = "";
        document.getElementById("accountName").value = "";


    } catch (error) {

        console.error(error);

        alert(error.message);

    }

});
