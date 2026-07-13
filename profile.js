import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";




// ==============================
// LOAD PROFILE
// ==============================

onAuthStateChanged(auth, async (user) => {


    if(!user){

        window.location.href = "login.html";

        return;

    }



    try{


        const userRef =
        doc(db,"users",user.uid);



        const userSnap =
        await getDoc(userRef);



        if(!userSnap.exists()){

            alert("User profile not found.");

            return;

        }



        const data =
        userSnap.data();





        // ==========================
        // BASIC INFORMATION
        // ==========================


        document.getElementById("fullname").textContent =
        data.fullname || "No Name";



        document.getElementById("email").textContent =
        data.email || user.email;



        document.getElementById("balance").textContent =
        Number(data.balance || 0)
        .toLocaleString();







        // ==========================
        // PROFIT INFORMATION
        // ==========================


        const totalProfit =
        document.getElementById("totalProfit");


        if(totalProfit){

            totalProfit.textContent =
            Number(data.totalProfit || 0)
            .toLocaleString();

        }




        const referralBonus =
        document.getElementById("referralBonus");


        if(referralBonus){

            referralBonus.textContent =
            Number(data.referralBonus || 0)
            .toLocaleString();

        }







        // ==========================
        // REFERRAL CODE
        // ==========================


        const referralCode =
        document.getElementById("referralCode");


        if(referralCode){

            referralCode.textContent =
            data.referralCode || "Not Available";

        }







        // ==========================
        // BANK DETAILS
        // ==========================


        const bankName =
        document.getElementById("bankName");


        const accountNumber =
        document.getElementById("accountNumber");


        const accountName =
        document.getElementById("accountName");



        if(bankName){

            bankName.textContent =
            data.bankName || "Not Added";

        }



        if(accountNumber){

            accountNumber.textContent =
            data.accountNumber || "Not Added";

        }



        if(accountName){

            accountName.textContent =
            data.accountName || "Not Added";

        }



    }



    catch(error){

        console.error(error);

        alert(error.message);

    }


});







// ==============================
// LOGOUT
// ==============================


const logoutBtn =
document.getElementById("logoutBtn");


if(logoutBtn){


    logoutBtn.addEventListener(
    "click",
    async()=>{


        try{


            await signOut(auth);


            window.location.href =
            "login.html";


        }


        catch(error){


            console.error(error);

            alert(error.message);


        }


    });


}
