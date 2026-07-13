import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    setDoc,
    collection,
    query,
    where,
    getDocs,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";



// ==============================
// CHECK REFERRAL LINK
// ==============================

const referralInput =
document.getElementById("referralCode");


const params =
new URLSearchParams(window.location.search);


const referralFromURL =
params.get("ref");


if(referralFromURL){

    referralInput.value =
    referralFromURL;

    referralInput.readOnly = true;

}
else{

    alert(
        "Registration is by invitation only."
    );

    window.location.href =
    "index.html";

}



// ==============================
// BUTTON
// ==============================

const signupBtn =
document.getElementById("signupBtn");


signupBtn.addEventListener(
    "click",
    registerUser
);




// ==============================
// GENERATE REFERRAL CODE
// ==============================

async function generateReferralCode(){


    const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";


    let code;

    let exists = true;



    while(exists){


        code = "TOP-";


        for(let i=0;i<6;i++){

            code +=
            characters[
                Math.floor(
                    Math.random()
                    *
                    characters.length
                )
            ];

        }



        const q =
        query(
            collection(db,"users"),
            where(
                "referralCode",
                "==",
                code
            )
        );



        const snap =
        await getDocs(q);



        exists =
        !snap.empty;


    }


    return code;

}





// ==============================
// REGISTER USER
// ==============================

async function registerUser(){


    signupBtn.disabled = true;

    signupBtn.innerText =
    "Creating Account...";



    try{


        const fullname =
        document.getElementById("fullname")
        .value
        .trim();



        const email =
        document.getElementById("email")
        .value
        .trim()
        .toLowerCase();



        const password =
        document.getElementById("password")
        .value;



        const confirmPassword =
        document.getElementById("confirmPassword")
        .value;



        const referredBy =
        referralInput.value.trim();




        if(
            !fullname ||
            !email ||
            !password ||
            !confirmPassword
        ){

            throw new Error(
                "Please fill all fields."
            );

        }




        if(password.length < 6){

            throw new Error(
                "Password must contain at least 6 characters."
            );

        }




        if(password !== confirmPassword){

            throw new Error(
                "Passwords do not match."
            );

        }




        if(!referredBy){

            throw new Error(
                "Referral code required."
            );

        }




        // ==========================
        // VERIFY REFERRER
        // ==========================


        const referralQuery =
        query(
            collection(db,"users"),
            where(
                "referralCode",
                "==",
                referredBy
            )
        );



        const referralSnap =
        await getDocs(referralQuery);



        if(referralSnap.empty){

            throw new Error(
                "Invalid referral code."
            );

        }



        const referrerDoc =
        referralSnap.docs[0];





        // ==========================
        // CREATE ACCOUNT
        // ==========================


        const userCredential =
        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );




        const myReferralCode =
        await generateReferralCode();





        // ==========================
        // SAVE USER
        // ==========================


        await setDoc(
            doc(
                db,
                "users",
                userCredential.user.uid
            ),
            {

                fullname,

                email,

                balance:0,

                totalDeposit:0,

                totalWithdrawal:0,

                totalProfit:0,

                referralBonus:0,

                referralRewardPaid:false,

                totalReferrals:0,

                referralCode:
                myReferralCode,

                referredBy,

                bankName:"",

                accountNumber:"",

                accountName:"",

                activePlan:null,

                createdAt:
                new Date().toISOString()

            }
        );





        // ==========================
        // UPDATE REFERRER COUNT
        // ==========================


        const referrerData =
        referrerDoc.data();



        await updateDoc(
            doc(
                db,
                "users",
                referrerDoc.id
            ),
            {

                totalReferrals:
                Number(
                    referrerData.totalReferrals || 0
                )
                + 1

            }
        );




        alert(
            "🎉 Account created successfully!"
        );



        window.location.href =
        "login.html";



    }


    catch(error){


        console.error(error);

        alert(error.message);


    }


    finally{


        signupBtn.disabled = false;


        signupBtn.innerText =
        "Create Account";


    }


}
