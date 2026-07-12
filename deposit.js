import { auth, db } from "./firebase.js";

import {
    addDoc,
    collection
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


const depositBtn = document.getElementById("depositBtn");

depositBtn.addEventListener("click", submitDeposit);


// ===================================
// SUBMIT DEPOSIT
// ===================================

async function submitDeposit() {

    depositBtn.disabled = true;

    depositBtn.innerText = "Submitting...";

    try {

        const user = auth.currentUser;

        if (!user) {

            throw new Error("Please login first.");

        }


        const amount = Number(

            document.getElementById("amount").value

        );

        const method =

            document.getElementById("method").value;

        const reference =

            document.getElementById("reference").value.trim();



        // ===========================
        // VALIDATION
        // ===========================

        if (isNaN(amount) || amount <= 0) {

            throw new Error("Please enter a valid deposit amount.");

        }


        if (!reference) {

            throw new Error("Please enter your transaction reference.");

        }



        // ===========================
        // SAVE REQUEST
        // ===========================

        await addDoc(

            collection(db, "depositRequests"),

            {

                userId: user.uid,

                email: user.email,

                amount: amount,

                method: method,

                reference: reference,

                status: "Pending",

                createdAt: new Date().toISOString()

            }

        );



        document.getElementById("status").innerHTML =

            "✅ Your deposit request has been submitted successfully.<br><br>Please wait for admin approval before the amount appears in your wallet.";



        // ===========================
        // CLEAR FORM
        // ===========================

        document.getElementById("amount").value = "";

        document.getElementById("reference").value = "";

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

    finally {

        depositBtn.disabled = false;

        depositBtn.innerText = "Submit Deposit Request";

    }

}
