alert("plans.js loaded");
import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const adminEmail = "topinvestnigeria@gmail.com";

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    if (user.email !== adminEmail) {
        alert("Access Denied");
        window.location.href = "dashboard.html";
        return;
    }

    loadDeposits();
    loadWithdrawals();

});



// ===============================
// LOAD DEPOSIT REQUESTS
// ===============================

async function loadDeposits() {

    const depositList = document.getElementById("depositList");
    depositList.innerHTML = "";

    const snapshot = await getDocs(collection(db, "depositRequests"));

    if (snapshot.empty) {
        depositList.innerHTML = "<p>No deposit requests.</p>";
        return;
    }

    snapshot.forEach((document) => {

        const data = document.data();

        depositList.innerHTML += `

        <div class="transaction-card">

            <p><strong>Email:</strong> ${data.email}</p>

            <p><strong>Amount:</strong> ₦${Number(data.amount).toLocaleString()}</p>

            <p><strong>Method:</strong> ${data.method}</p>

            <p><strong>Status:</strong> ${data.status}</p>

            <button
                class="approveBtn"
                data-id="${document.id}"
                ${data.status === "Approved" ? "disabled" : ""}>

                ${data.status === "Approved" ? "Approved ✅" : "Approve"}

            </button>

        </div>

        `;

    });

    document.querySelectorAll(".approveBtn").forEach((button) => {

        button.addEventListener("click", approveDeposit);

    });

}



// ===============================
// APPROVE DEPOSIT
// ===============================

async function approveDeposit(event) {

    const id = event.target.dataset.id;

    const depositRef = doc(db, "depositRequests", id);
    const depositSnap = await getDoc(depositRef);

    if (!depositSnap.exists()) {
        alert("Deposit not found.");
        return;
    }

    const deposit = depositSnap.data();

    if (deposit.status === "Approved") {
        alert("Already approved.");
        return;
    }

    const userRef = doc(db, "users", deposit.userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        alert("User not found.");
        return;
    }

    const userData = userSnap.data();

    await updateDoc(userRef, {
        balance: Number(userData.balance) + Number(deposit.amount)
    });

    await updateDoc(depositRef, {
        status: "Approved"
    });

    alert("Deposit approved successfully.");

    location.reload();

}



// ===============================
// LOAD WITHDRAWALS
// ===============================

async function loadWithdrawals() {

    const withdrawList = document.getElementById("withdrawList");
    withdrawList.innerHTML = "";

    const snapshot = await getDocs(collection(db, "withdrawRequests"));

    if (snapshot.empty) {
        withdrawList.innerHTML = "<p>No withdrawal requests.</p>";
        return;
    }

    snapshot.forEach((document) => {

        const data = document.data();

        withdrawList.innerHTML += `

        <div class="transaction-card">

            <p><strong>Email:</strong> ${data.email}</p>

            <p><strong>Amount:</strong> ₦${Number(data.amount).toLocaleString()}</p>

            <p><strong>Bank:</strong> ${data.bank}</p>

            <p><strong>Account:</strong> ${data.accountNumber}</p>

            <p><strong>Account Name:</strong> ${data.accountName}</p>

            <p><strong>Status:</strong> ${data.status}</p>

            <button
                class="withdrawApproveBtn"
                data-id="${document.id}"
                ${data.status === "Approved" ? "disabled" : ""}>

                ${data.status === "Approved" ? "Approved ✅" : "Approve"}

            </button>

        </div>

        `;

    });

    document.querySelectorAll(".withdrawApproveBtn").forEach((button) => {

        button.addEventListener("click", approveWithdrawal);

    });

}



// ===============================
// APPROVE WITHDRAWAL
// ===============================

async function approveWithdrawal(event) {

    const id = event.target.dataset.id;

    const withdrawRef = doc(db, "withdrawRequests", id);
    const withdrawSnap = await getDoc(withdrawRef);

    if (!withdrawSnap.exists()) {
        alert("Withdrawal not found.");
        return;
    }

    const withdraw = withdrawSnap.data();

    if (withdraw.status === "Approved") {
        alert("Already approved.");
        return;
    }

    const userRef = doc(db, "users", withdraw.userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        alert("User not found.");
        return;
    }

    const userData = userSnap.data();

    if (Number(userData.balance) < Number(withdraw.amount)) {
        alert("Insufficient balance.");
        return;
    }

    await updateDoc(userRef, {
        balance: Number(userData.balance) - Number(withdraw.amount)
    });

    await updateDoc(withdrawRef, {
        status: "Approved"
    });

    alert("Withdrawal approved successfully.");

    location.reload();

}
