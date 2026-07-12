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

    await loadStatistics();

    await loadUsers();

    await loadDeposits();

    await loadWithdrawals();

    await loadInvestments();

});



// =========================
// DASHBOARD STATISTICS
// =========================

async function loadStatistics() {

    const usersSnapshot =
        await getDocs(collection(db, "users"));

    const depositSnapshot =
        await getDocs(collection(db, "depositRequests"));

    const withdrawSnapshot =
        await getDocs(collection(db, "withdrawRequests"));

    const investmentSnapshot =
        await getDocs(collection(db, "investments"));



    document.getElementById("totalUsers").innerText =
        usersSnapshot.size;



    let totalDeposits = 0;

    depositSnapshot.forEach((document) => {

        const data = document.data();

        if (data.status === "Approved") {

            totalDeposits += Number(data.amount);

        }

    });

    document.getElementById("totalDeposits").innerText =
        "₦" + totalDeposits.toLocaleString();



    let totalWithdrawals = 0;

    withdrawSnapshot.forEach((document) => {

        const data = document.data();

        if (data.status === "Approved") {

            totalWithdrawals += Number(data.amount);

        }

    });

    document.getElementById("totalWithdrawals").innerText =
        "₦" + totalWithdrawals.toLocaleString();



    let activePlans = 0;

    investmentSnapshot.forEach((document) => {

        if (document.data().status === "Active") {

            activePlans++;

        }

    });

    document.getElementById("activePlans").innerText =
        activePlans;

}



// =========================
// USERS
// =========================

async function loadUsers() {

    const userList =
        document.getElementById("userList");

    if (!userList) return;

    userList.innerHTML = "";

    const snapshot =
        await getDocs(collection(db, "users"));

    if (snapshot.empty) {

        userList.innerHTML =
            "<p>No users found.</p>";

        return;

    }

    snapshot.forEach((document) => {

        const data = document.data();

        userList.innerHTML += `

        <div class="transaction-card">

            <h3>${data.fullname}</h3>

            <p><strong>Email:</strong> ${data.email}</p>

            <p><strong>Balance:</strong>
            ₦${Number(data.balance || 0).toLocaleString()}</p>

        </div>

        `;

    });

}



// =========================
// DEPOSIT REQUESTS
// =========================

async function loadDeposits() {

    const depositList =
        document.getElementById("depositList");

    if (!depositList) return;

    depositList.innerHTML = "";

    const snapshot =
        await getDocs(collection(db, "depositRequests"));

    if (snapshot.empty) {

        depositList.innerHTML =
            "<p>No deposit requests.</p>";

        return;

    }

    snapshot.forEach((document) => {

        const data = document.data();

        depositList.innerHTML += `

        <div class="transaction-card">

            <h3>${data.email}</h3>

            <p>
                <strong>Amount:</strong>
                ₦${Number(data.amount).toLocaleString()}
            </p>

            <p>
                <strong>Method:</strong>
                ${data.method}
            </p>

            <p>
                <strong>Reference:</strong>
                ${data.reference}
            </p>

            <p>
                <strong>Status:</strong>
                ${data.status}
            </p>

            <div style="display:flex;gap:10px;margin-top:15px;">

                <button
                    class="approveDepositBtn btn"
                    data-id="${document.id}"
                    ${data.status==="Approved"?"disabled":""}>

                    ${
                        data.status==="Approved"
                        ? "Approved ✅"
                        : "Approve"
                    }

                </button>

            </div>

        </div>

        `;

    });

    document
        .querySelectorAll(".approveDepositBtn")
        .forEach((button)=>{

            button.addEventListener(
                "click",
                approveDeposit
            );

        });

}



// =========================
// APPROVE DEPOSIT
// =========================

async function approveDeposit(event){

    try{

        const id =
        event.target.dataset.id;

        const depositRef =
        doc(db,"depositRequests",id);

        const depositSnap =
        await getDoc(depositRef);

        if(!depositSnap.exists()){

            alert("Deposit not found.");

            return;

        }

        const deposit =
        depositSnap.data();

        if(deposit.status==="Approved"){

            alert("Already approved.");

            return;

        }

        const userRef =
        doc(db,"users",deposit.userId);

        const userSnap =
        await getDoc(userRef);

        if(!userSnap.exists()){

            alert("User not found.");

            return;

        }

        const user =
        userSnap.data();

        await updateDoc(userRef,{

            balance:
            Number(user.balance)+
            Number(deposit.amount)

        });

        await updateDoc(depositRef,{

            status:"Approved"

        });

        alert("Deposit approved successfully.");

        await loadStatistics();

        await loadDeposits();

        await loadUsers();

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

}



// =========================
// WITHDRAWAL REQUESTS
// =========================

async function loadWithdrawals() {

    const withdrawList =
        document.getElementById("withdrawList");

    if (!withdrawList) return;

    withdrawList.innerHTML = "";

    const snapshot =
        await getDocs(collection(db, "withdrawRequests"));

    if (snapshot.empty) {

        withdrawList.innerHTML =
            "<p>No withdrawal requests.</p>";

        return;

    }

    snapshot.forEach((document) => {

        const data = document.data();

        withdrawList.innerHTML += `

        <div class="transaction-card">

            <h3>${data.email}</h3>

            <p><strong>Amount:</strong>
            ₦${Number(data.amount).toLocaleString()}</p>

            <p><strong>Bank:</strong>
            ${data.bank}</p>

            <p><strong>Account Number:</strong>
            ${data.accountNumber}</p>

            <p><strong>Account Name:</strong>
            ${data.accountName}</p>

            <p><strong>Status:</strong>
            ${data.status}</p>

            <button
                class="approveWithdrawBtn btn"
                data-id="${document.id}"
                ${data.status==="Approved" ? "disabled" : ""}>

                ${
                    data.status==="Approved"
                    ? "Approved ✅"
                    : "Approve"
                }

            </button>

        </div>

        `;

    });

    document
        .querySelectorAll(".approveWithdrawBtn")
        .forEach((button)=>{

            button.addEventListener(
                "click",
                approveWithdrawal
            );

        });

}



// =========================
// APPROVE WITHDRAWAL
// =========================

async function approveWithdrawal(event){

    try{

        const id =
        event.target.dataset.id;

        const withdrawRef =
        doc(db,"withdrawRequests",id);

        const withdrawSnap =
        await getDoc(withdrawRef);

        if(!withdrawSnap.exists()){

            alert("Withdrawal not found.");

            return;

        }

        const withdraw =
        withdrawSnap.data();

        if(withdraw.status==="Approved"){

            alert("Already approved.");

            return;

        }

        const userRef =
        doc(db,"users",withdraw.userId);

        const userSnap =
        await getDoc(userRef);

        if(!userSnap.exists()){

            alert("User not found.");

            return;

        }

        const user =
        userSnap.data();

        if(Number(user.balance) < Number(withdraw.amount)){

            alert("User has insufficient balance.");

            return;

        }

        await updateDoc(userRef,{
            balance:
            Number(user.balance) -
            Number(withdraw.amount)
        });

        await updateDoc(withdrawRef,{
            status:"Approved"
        });

        alert("Withdrawal approved.");

        await loadStatistics();

        await loadWithdrawals();

        await loadUsers();

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

}



// =========================
// ACTIVE INVESTMENTS
// =========================

async function loadInvestments(){

    const investmentList =
        document.getElementById("investmentList");

    if(!investmentList) return;

    investmentList.innerHTML = "";

    const snapshot =
        await getDocs(collection(db,"investments"));

    if(snapshot.empty){

        investmentList.innerHTML =
            "<p>No active investments.</p>";

        return;

    }

    let found = false;

    snapshot.forEach((document)=>{

        const data = document.data();

        if(data.status !== "Active") return;

        found = true;

        investmentList.innerHTML += `

        <div class="transaction-card">

            <h3>${data.planName}</h3>

            <p><strong>User:</strong>
            ${data.email}</p>

            <p><strong>Investment:</strong>
            ₦${Number(data.investmentAmount).toLocaleString()}</p>

            <p><strong>Daily Profit:</strong>
            ₦${Number(data.dailyProfit).toLocaleString()}</p>

            <p><strong>Status:</strong>
            🟢 Active</p>

        </div>

        `;

    });

    if(!found){

        investmentList.innerHTML =
            "<p>No active investments.</p>";

    }

}
