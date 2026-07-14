import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


let currentUser = null;



// =============================
// CHECK LOGIN
// =============================

onAuthStateChanged(auth, (user)=>{


    if(!user){

        window.location.href =
        "login.html";

        return;

    }


    currentUser = user;


});





// =============================
// INVEST BUTTONS
// =============================


document.querySelectorAll(".investBtn")
.forEach((button)=>{


    button.addEventListener(
        "click",
        ()=>invest(button)
    );


});







// =============================
// INVEST FUNCTION
// =============================


async function invest(button){


    button.disabled = true;

    button.innerText =
    "Processing...";



    try{


        if(!currentUser){

            throw new Error(
                "Please login first."
            );

        }




        const planName =
        button.dataset.name;



        const amount =
        Number(button.dataset.amount);



        const dailyProfit =
        Number(button.dataset.profit);






        // USER DATA


        const userRef =
        doc(
            db,
            "users",
            currentUser.uid
        );



        const userSnap =
        await getDoc(userRef);



        if(!userSnap.exists()){

            throw new Error(
                "User account not found."
            );

        }



        const user =
        userSnap.data();







        // CHECK BALANCE


        if(
            Number(user.balance || 0)
            <
            amount
        ){

            throw new Error(
                "Insufficient wallet balance."
            );

        }







        // CHECK ACTIVE PLAN


        const activeQuery =
        query(

            collection(db,"investments"),

            where(
                "userId",
                "==",
                currentUser.uid
            ),

            where(
                "status",
                "==",
                "Active"
            )

        );



        const activeSnap =
        await getDocs(activeQuery);



        if(!activeSnap.empty){

            throw new Error(
                "You already have an active investment."
            );

        }







        // CREATE INVESTMENT


        await addDoc(
    collection(db,"investments"),
    {

        userId: currentUser.uid,

        email: currentUser.email,

        planName,

        investmentAmount: amount,

        dailyProfit: dailyProfit,

        totalProfit: 0,

        daysPaid: 0,

        duration: 30,

        status: "Active",

        createdAt: serverTimestamp(),

        lastProfitDate: serverTimestamp()

    }
);






        // UPDATE USER WALLET


        await updateDoc(
            userRef,
            {

                balance:
                Number(user.balance || 0)
                -
                amount,


               activePlan:{

                   planName,

                   investmentAmount: amount,

                   dailyProfit: dailyProfit,

                   totalProfit: 0,

                   daysPaid: 0,

                   duration: 30,

                   status: "Active",

                   startDate: new Date().toISOString()

} 

            }
        );







        // =============================
        // 20% REFERRAL BONUS
        // =============================


        if(
            user.referredBy &&
            user.referralRewardPaid !== true
        ){



            const referralQuery =
            query(

                collection(db,"users"),

                where(
                    "referralCode",
                    "==",
                    user.referredBy
                )

            );



            const referralSnap =
            await getDocs(referralQuery);



            if(!referralSnap.empty){



                const referrerDoc =
                referralSnap.docs[0];



                const referrer =
                referrerDoc.data();



                const reward =
                amount * 0.20;



                await updateDoc(

                    doc(
                        db,
                        "users",
                        referrerDoc.id
                    ),

                    {

                        balance:
                        Number(
                            referrer.balance || 0
                        )
                        +
                        reward,


                        referralBonus:
                        Number(
                            referrer.referralBonus || 0
                        )
                        +
                        reward,


                        totalProfit:
                        Number(
                            referrer.totalProfit || 0
                        )
                        +
                        reward

                    }

                );






                await addDoc(

                    collection(
                        db,
                        "referralRewards"
                    ),

                    {

                        referrerId:
                        referrerDoc.id,


                        referredUser:
                        currentUser.uid,


                        amountInvested:
                        amount,


                        reward,


                        createdAt:
                        serverTimestamp()

                    }

                );






                await updateDoc(
                    userRef,
                    {

                        referralRewardPaid:true

                    }
                );



            }



        }








        alert(
            "🎉 Investment activated successfully!"
        );



        window.location.href =
        "dashboard.html";




    }


    catch(error){


        console.error(error);

        alert(
            error.message
        );


    }


    finally{


        button.disabled = false;

        button.innerText =
        "Invest Now";


    }


}
