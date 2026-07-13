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



// =============================
// ADMIN CHECK
// =============================

onAuthStateChanged(auth, async (user)=>{


    if(!user){

        window.location.href =
        "login.html";

        return;

    }



    if(user.email !== adminEmail){


        alert("Access Denied");


        window.location.href =
        "dashboard.html";


        return;

    }



    try{


        await loadStatistics();

        await loadUsers();

        await loadDeposits();

        await loadWithdrawals();

        await loadInvestments();



    }


    catch(error){


        console.error(error);

        alert(error.message);


    }



});







// =============================
// STATISTICS
// =============================

async function loadStatistics(){


    try{


        const users =
        await getDocs(
            collection(db,"users")
        );


        const deposits =
        await getDocs(
            collection(db,"depositRequests")
        );


        const withdrawals =
        await getDocs(
            collection(db,"withdrawRequests")
        );


        const investments =
        await getDocs(
            collection(db,"investments")
        );





        document.getElementById("totalUsers")
        .innerText =
        users.size;





        let totalDeposits = 0;


        deposits.forEach((item)=>{


            const data =
            item.data();



            if(data.status === "Approved"){


                totalDeposits +=
                Number(data.amount || 0);


            }


        });




        document.getElementById("totalDeposits")
        .innerText =
        "₦" +
        totalDeposits.toLocaleString();







        let totalWithdrawals = 0;


        withdrawals.forEach((item)=>{


            const data =
            item.data();



            if(data.status === "Approved"){


                totalWithdrawals +=
                Number(data.amount || 0);


            }


        });





        document.getElementById("totalWithdrawals")
        .innerText =
        "₦" +
        totalWithdrawals.toLocaleString();







        let active = 0;


        investments.forEach((item)=>{


            if(item.data().status === "Active"){

                active++;

            }


        });





        document.getElementById("activePlans")
        .innerText =
        active;



    }


    catch(error){


        console.error(error);

    }


}







// =============================
// USERS
// =============================

async function loadUsers(){


    const userList =
    document.getElementById("userList");


    if(!userList) return;



    userList.innerHTML = "";



    const snapshot =
    await getDocs(
        collection(db,"users")
    );



    if(snapshot.empty){


        userList.innerHTML =
        "<p>No users found.</p>";


        return;


    }






    snapshot.forEach((item)=>{


        const data =
        item.data();




        userList.innerHTML += `


        <div class="transaction-card">


            <h3>
            ${data.fullname || "Unknown"}
            </h3>


            <p>
            <strong>Email:</strong>
            ${data.email}
            </p>



            <p>
            <strong>Balance:</strong>

            ₦${Number(
                data.balance || 0
            ).toLocaleString()}

            </p>



            <p>
            <strong>Referral Bonus:</strong>

            ₦${Number(
                data.referralBonus || 0
            ).toLocaleString()}

            </p>



        </div>


        `;



    });



}







// =============================
// DEPOSIT REQUESTS
// =============================

async function loadDeposits(){



    const depositList =
    document.getElementById("depositList");



    if(!depositList) return;



    depositList.innerHTML = "";



    const snapshot =
    await getDocs(
        collection(db,"depositRequests")
    );



    if(snapshot.empty){


        depositList.innerHTML =
        "<p>No deposit requests.</p>";


        return;


    }





    snapshot.forEach((item)=>{


        const data =
        item.data();




        depositList.innerHTML += `


        <div class="transaction-card">


            <h3>
            ${data.email}
            </h3>


            <p>
            <strong>Amount:</strong>

            ₦${Number(
                data.amount
            ).toLocaleString()}

            </p>



            <p>
            <strong>Method:</strong>
            ${data.method}
            </p>




            <p>
            <strong>Status:</strong>
            ${data.status}
            </p>



            <button

            class="approveDepositBtn btn"

            data-id="${item.id}"

            ${data.status==="Approved" 
            ? "disabled"
            : ""}

            >

            ${data.status==="Approved"
            ? "Approved ✅"
            : "Approve"}

            </button>



        </div>


        `;


    });




    document
    .querySelectorAll(".approveDepositBtn")
    .forEach((btn)=>{


        btn.addEventListener(
            "click",
            approveDeposit
        );


    });



}





// =============================
// APPROVE DEPOSIT
// =============================

async function approveDeposit(event){


    const id =
    event.target.dataset.id;



    const depositRef =
    doc(
        db,
        "depositRequests",
        id
    );



    const snap =
    await getDoc(depositRef);



    if(!snap.exists()){

        alert("Deposit not found.");

        return;

    }




    const deposit =
    snap.data();



    if(deposit.status==="Approved"){

        alert("Already approved.");

        return;

    }




    const userRef =
    doc(
        db,
        "users",
        deposit.userId
    );



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
        Number(user.balance || 0)
        +
        Number(deposit.amount)

    });



    await updateDoc(depositRef,{

        status:"Approved"

    });



    alert(
        "Deposit approved successfully."
    );



    await loadStatistics();

    await loadDeposits();

    await loadUsers();


}



// =============================
// WITHDRAWAL REQUESTS
// =============================

async function loadWithdrawals(){


    const withdrawList =
    document.getElementById("withdrawList");


    if(!withdrawList) return;



    withdrawList.innerHTML = "";



    const snapshot =
    await getDocs(
        collection(db,"withdrawRequests")
    );



    if(snapshot.empty){


        withdrawList.innerHTML =
        "<p>No withdrawal requests.</p>";


        return;


    }





    snapshot.forEach((item)=>{


        const data =
        item.data();



        withdrawList.innerHTML += `


        <div class="transaction-card">


            <h3>
            ${data.email}
            </h3>


            <p>
            <strong>Amount:</strong>

            ₦${Number(
                data.amount || 0
            ).toLocaleString()}

            </p>


            <p>
            <strong>Bank:</strong>
            ${data.bank}
            </p>


            <p>
            <strong>Account:</strong>
            ${data.accountNumber}
            </p>


            <p>
            <strong>Name:</strong>
            ${data.accountName}
            </p>


            <p>
            <strong>Status:</strong>
            ${data.status}
            </p>



            <button

            class="approveWithdrawBtn btn"

            data-id="${item.id}"

            ${data.status==="Approved"
            ? "disabled"
            : ""}

            >

            ${data.status==="Approved"
            ? "Approved ✅"
            : "Approve"}

            </button>



        </div>


        `;


    });





    document
    .querySelectorAll(".approveWithdrawBtn")
    .forEach((btn)=>{


        btn.addEventListener(
            "click",
            approveWithdrawal
        );


    });



}







// =============================
// APPROVE WITHDRAWAL
// =============================

async function approveWithdrawal(event){



    const id =
    event.target.dataset.id;



    const withdrawRef =
    doc(
        db,
        "withdrawRequests",
        id
    );



    const withdrawSnap =
    await getDoc(withdrawRef);



    if(!withdrawSnap.exists()){


        alert(
            "Withdrawal not found."
        );


        return;

    }





    const withdraw =
    withdrawSnap.data();




    if(withdraw.status==="Approved"){


        alert(
            "Already approved."
        );


        return;


    }





    const userRef =
    doc(
        db,
        "users",
        withdraw.userId
    );



    const userSnap =
    await getDoc(userRef);



    if(!userSnap.exists()){


        alert(
            "User not found."
        );


        return;


    }





    const user =
    userSnap.data();





    if(
        Number(user.balance || 0)
        <
        Number(withdraw.amount)
    ){


        alert(
            "Insufficient user balance."
        );


        return;


    }






    await updateDoc(

        userRef,

        {


            balance:
            Number(user.balance || 0)
            -
            Number(withdraw.amount)


        }

    );





    await updateDoc(

        withdrawRef,

        {

            status:"Approved"

        }

    );





    alert(
        "Withdrawal approved."
    );




    await loadStatistics();

    await loadWithdrawals();

    await loadUsers();



}









// =============================
// ACTIVE INVESTMENTS
// =============================

async function loadInvestments(){



    const investmentList =
    document.getElementById("investmentList");



    if(!investmentList) return;



    investmentList.innerHTML = "";



    const snapshot =
    await getDocs(
        collection(db,"investments")
    );



    if(snapshot.empty){


        investmentList.innerHTML =
        "<p>No investments yet.</p>";


        return;


    }




    let found = false;



    snapshot.forEach((item)=>{


        const data =
        item.data();



        if(data.status !== "Active")
        return;




        found = true;




        investmentList.innerHTML += `


        <div class="transaction-card">


            <h3>
            ${data.planName}
            </h3>



            <p>
            <strong>User:</strong>

            ${data.email}

            </p>



            <p>
            <strong>Investment:</strong>

            ₦${Number(
                data.investmentAmount || 0
            ).toLocaleString()}

            </p>



            <p>
            <strong>Daily Profit:</strong>

            ₦${Number(
                data.dailyProfit || 0
            ).toLocaleString()}

            </p>



            <p>
            <strong>Status:</strong>

            🟢 Active

            </p>


        </div>


        `;



    });





    if(!found){


        investmentList.innerHTML =
        "<p>No active investments.</p>";


    }



}
