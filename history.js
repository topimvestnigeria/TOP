import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// =========================
// ELEMENTS
// =========================

const depositHistory =
document.getElementById("depositHistory");

const withdrawHistory =
document.getElementById("withdrawHistory");

const investmentHistory =
document.getElementById("investmentHistory");

const referralHistory =
document.getElementById("referralHistory");



// =========================
// CHECK LOGIN
// =========================

onAuthStateChanged(auth, async (user)=>{


    if(!user){

        window.location.href = "login.html";

        return;

    }


    try{


        await loadDeposits(user.uid);

        await loadWithdrawals(user.uid);

        await loadInvestments(user.uid);

        await loadReferralRewards(user.uid);


    }


    catch(error){

        console.error(error);

        alert(error.message);

    }


});





// =========================
// DEPOSIT HISTORY
// =========================

async function loadDeposits(uid){


    if(!depositHistory) return;


    const q = query(

        collection(db,"depositRequests"),

        where("userId","==",uid)

    );


    const snapshot =
    await getDocs(q);



    if(snapshot.empty){

        depositHistory.innerHTML =
        "<p>No deposits found.</p>";

        return;

    }



    depositHistory.innerHTML = "";



    snapshot.forEach((document)=>{


        const data =
        document.data();



        depositHistory.innerHTML += `

        <div class="transaction-card">


            <h3>
            Deposit
            </h3>


            <p>
            <strong>Amount:</strong>
            ₦${Number(data.amount).toLocaleString()}
            </p>


            <p>
            <strong>Method:</strong>
            ${data.method}
            </p>


            <p>
            <strong>Status:</strong>
            ${statusBadge(data.status)}
            </p>


            <p>
            <strong>Date:</strong>
            ${formatDate(data.createdAt)}
            </p>


        </div>

        `;


    });


}







// =========================
// WITHDRAWAL HISTORY
// =========================

async function loadWithdrawals(uid){


    if(!withdrawHistory) return;



    const q = query(

        collection(db,"withdrawRequests"),

        where("userId","==",uid)

    );



    const snapshot =
    await getDocs(q);



    if(snapshot.empty){


        withdrawHistory.innerHTML =
        "<p>No withdrawals found.</p>";


        return;


    }



    withdrawHistory.innerHTML = "";



    snapshot.forEach((document)=>{


        const data =
        document.data();



        withdrawHistory.innerHTML += `


        <div class="transaction-card">


            <h3>
            Withdrawal
            </h3>


            <p>
            <strong>Amount:</strong>
            ₦${Number(data.amount).toLocaleString()}
            </p>


            <p>
            <strong>Bank:</strong>
            ${data.bank}
            </p>


            <p>
            <strong>Status:</strong>
            ${statusBadge(data.status)}
            </p>


            <p>
            <strong>Date:</strong>
            ${formatDate(data.createdAt)}
            </p>


        </div>


        `;


    });


}







// =========================
// INVESTMENT HISTORY
// =========================

async function loadInvestments(uid){


    if(!investmentHistory) return;



    const q = query(

        collection(db,"investments"),

        where("userId","==",uid)

    );



    const snapshot =
    await getDocs(q);



    if(snapshot.empty){


        investmentHistory.innerHTML =
        "<p>No investments yet.</p>";


        return;


    }




    investmentHistory.innerHTML = "";



    snapshot.forEach((document)=>{


        const data =
        document.data();



        investmentHistory.innerHTML += `


        <div class="transaction-card">


            <h3>
            ${data.planName}
            </h3>


            <p>
            <strong>Investment:</strong>
            ₦${Number(data.investmentAmount).toLocaleString()}
            </p>


            <p>
            <strong>Daily Profit:</strong>
            ₦${Number(data.dailyProfit).toLocaleString()}
            </p>


            <p>
            <strong>Status:</strong>
            ${statusBadge(data.status)}
            </p>


            <p>
            <strong>Date:</strong>
            ${formatDate(data.createdAt)}
            </p>


        </div>


        `;


    });


}







// =========================
// REFERRAL REWARD HISTORY
// =========================

async function loadReferralRewards(uid){


    if(!referralHistory) return;



    const q = query(

        collection(db,"referralRewards"),

        where("referrerId","==",uid)

    );



    const snapshot =
    await getDocs(q);



    if(snapshot.empty){


        referralHistory.innerHTML =
        "<p>No referral rewards yet.</p>";


        return;


    }



    referralHistory.innerHTML = "";



    snapshot.forEach((document)=>{


        const data =
        document.data();



        referralHistory.innerHTML += `


        <div class="transaction-card">


            <h3>
            Referral Reward 🎁
            </h3>


            <p>
            <strong>Reward:</strong>
            ₦${Number(data.reward).toLocaleString()}
            </p>


            <p>
            <strong>Investment Amount:</strong>
            ₦${Number(data.amountInvested || 0).toLocaleString()}
            </p>


            <p>
            <strong>Date:</strong>
            ${formatDate(data.createdAt)}
            </p>


        </div>


        `;


    });


}







// =========================
// STATUS BADGE
// =========================

function statusBadge(status){


    if(status === "Approved"){


        return `
        <span style="color:green;font-weight:bold;">
        🟢 Approved
        </span>
        `;


    }


    if(status === "Rejected"){


        return `
        <span style="color:red;font-weight:bold;">
        🔴 Rejected
        </span>
        `;


    }


    return `

    <span style="color:orange;font-weight:bold;">
    🟡 Pending
    </span>

    `;


}







// =========================
// DATE FORMAT
// =========================

function formatDate(dateString){


    if(!dateString){

        return "-";

    }


    if(dateString.seconds){

        return new Date(
            dateString.seconds * 1000
        ).toLocaleString();

    }


    return new Date(dateString)
    .toLocaleString();


}
