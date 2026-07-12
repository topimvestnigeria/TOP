import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


const historyList = document.getElementById("historyList");


onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }


    try {

        historyList.innerHTML = "Loading transactions...";


        let transactions = [];


        // Deposit History

        const depositQuery = query(
            collection(db, "depositRequests"),
            where("userId", "==", user.uid)
        );


        const depositSnapshot = await getDocs(depositQuery);


        depositSnapshot.forEach((doc) => {

            const data = doc.data();

            transactions.push({

                type: "Deposit",

                amount: data.amount,

                status: data.status,

                date: data.createdAt

            });

        });



        // Withdrawal History

        const withdrawQuery = query(
            collection(db, "withdrawRequests"),
            where("userId", "==", user.uid)
        );


        const withdrawSnapshot = await getDocs(withdrawQuery);


        withdrawSnapshot.forEach((doc) => {

            const data = doc.data();

            transactions.push({

                type: "Withdrawal",

                amount: data.amount,

                status: data.status,

                date: data.createdAt

            });

        });



        if (transactions.length === 0) {

            historyList.innerHTML =
                "<p>No transactions found.</p>";

            return;

        }



        historyList.innerHTML = "";


        transactions.forEach((transaction) => {


            historyList.innerHTML += `

            <div class="transaction-card">

                <h3>${transaction.type}</h3>

                <p>
                <strong>Amount:</strong>
                ₦${Number(transaction.amount).toLocaleString()}
                </p>

                <p>
                <strong>Status:</strong>
                ${transaction.status}
                </p>

                <p>
                <strong>Date:</strong>
                ${transaction.date}
                </p>

            </div>

            `;


        });



    } catch (error) {

        console.error(error);

        historyList.innerHTML =
            "Error loading transactions.";

    }


});
