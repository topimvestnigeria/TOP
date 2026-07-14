import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";



onAuthStateChanged(auth, async (user) => {


    if (!user) {

        window.location.href = "login.html";

        return;

    }



    try {


        await loadUserData(user.uid);

        await loadInvestment(user.uid);



    }


    catch(error){


        console.error(error);

        alert(error.message);


    }



});







// ==========================
// LOAD USER DATA
// ==========================


async function loadUserData(uid){


    const userRef =
    doc(db, "users", uid);



    const userSnap =
    await getDoc(userRef);



    if(!userSnap.exists()){

        alert("User account not found.");

        return;

    }



    const data =
    userSnap.data();





    const welcomeUser =
    document.getElementById("welcomeUser");


    if(welcomeUser){

        welcomeUser.innerText =
        `Welcome, ${data.fullname} 👋`;

    }






    const balance =
    document.getElementById("balance");


    if(balance){

        balance.innerText =
        "₦" +
        Number(data.balance || 0)
        .toLocaleString();

    }






    const totalProfit =
    document.getElementById("totalProfit");


    if(totalProfit){

        totalProfit.innerText =
        "₦" +
        Number(data.totalProfit || 0)
        .toLocaleString();

    }






    const referralBonus =
    document.getElementById("referralBonus");


    if(referralBonus){

        referralBonus.innerText =
        "₦" +
        Number(data.referralBonus || 0)
        .toLocaleString();

    }






    const totalReferrals =
    document.getElementById("totalReferrals");


    if(totalReferrals){

        totalReferrals.innerText =
        Number(data.totalReferrals || 0);

    }







    const referralCode =
    document.getElementById("referralCode");


    if(referralCode){

        referralCode.innerText =
        data.referralCode || "Not Available";

    }






    const copyBtn =
    document.getElementById("copyReferralBtn");


    if(copyBtn){


        copyBtn.onclick = async()=>{


            const link =

            window.location.origin +

            "/signup.html?ref=" +

            data.referralCode;



            try{


                await navigator.clipboard.writeText(link);


                alert(
                    "Invitation link copied!"
                );


            }


            catch(error){


                alert(
                    "Copy failed."
                );


            }


        };


    }



}









// ==========================
// LOAD ACTIVE INVESTMENT
// ==========================


async function loadInvestment(uid){



    const container =
    document.getElementById("activeInvestment");



    if(!container){

        return;

    }






    const investmentQuery = query(

        collection(db,"investments"),

        where(
            "userId",
            "==",
            uid
        ),

        where(
            "status",
            "==",
            "Active"
        )

    );






    const snapshot =
    await getDocs(investmentQuery);





    if(snapshot.empty){


        container.innerHTML = `

        <p>
        No active investment yet.
        </p>

        `;


        return;


    }







    const investment =
    snapshot.docs[0].data();







    const progress =

    Math.round(

        (
            investment.daysPaid /

            investment.duration

        ) * 100

    );







    container.innerHTML = `


    <div class="transaction-card">


        <h3>
        ${investment.planName}
        </h3>



        <p>

        <strong>
        Investment:
        </strong>

        ₦${Number(
            investment.investmentAmount
        ).toLocaleString()}

        </p>





        <p>

        <strong>
        Daily Profit:
        </strong>

        ₦${Number(
            investment.dailyProfit
        ).toLocaleString()}

        </p>





        <p>

        <strong>
        Total Profit:
        </strong>

        ₦${Number(
            investment.totalProfit || 0
        ).toLocaleString()}

        </p>





        <p>

        <strong>
        Remaining Days:
        </strong>

        ${investment.remainingDays}

        </p>





        <p>

        <strong>
        Status:
        </strong>

        🟢 ${investment.status}

        </p>





        <div class="progress">


            <div

            class="progress-fill"

            style="width:${progress}%">

            </div>


        </div>



        <p>
        ${progress}% Completed
        </p>



    </div>



    `;



}
