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
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


let currentUser = null;


// =============================
// CHECK LOGIN
// =============================

onAuthStateChanged(auth, (user)=>{

    if(!user){

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

});



// =============================
// INVEST BUTTONS
// =============================

document.querySelectorAll(".investBtn")
.forEach((button)=>{

    button.addEventListener("click",()=>{

        invest(button);

    });

});




// =============================
// INVEST FUNCTION
// =============================

async function invest(button){


    button.disabled = true;

    button.innerText = "Processing...";


    try{


        if(!currentUser){

            throw new Error("Please login first.");

        }



        const planName = button.dataset.name;

        const amount = Number(button.dataset.amount);

        const dailyProfit = Number(button.dataset.profit);




        // =============================
        // GET USER DATA
        // =============================

        const userRef =
        doc(db,"users",currentUser.uid);


        const userSnap =
        await getDoc(userRef);



        if(!userSnap.exists()){

            throw new Error("User account not found.");

        }



        const user =
        userSnap.data();




        // =============================
        // CHECK WALLET
        // =============================


        if(Number(user.balance) < amount){

            throw new Error(
                "Insufficient wallet balance."
            );

        }





        // =============================
        // CHECK ACTIVE INVESTMENT
        // =============================


        const activeQuery = query(

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



        const activeSnapshot =
        await getDocs(activeQuery);



        if(!activeSnapshot.empty){

            throw new Error(
                "You already have an active investment."
            );

        }




        // =============================
        // CREATE INVESTMENT
        // =============================


        await addDoc(
            collection(db,"investments"),
            {

                userId: currentUser.uid,

                email: currentUser.email,

                planName: planName,

                investmentAmount: amount,

                dailyProfit: dailyProfit,

                totalProfit:0,

                status:"Active",

                createdAt:
                new Date().toISOString()

            }
        );





        // =============================
        // DEDUCT USER BALANCE
        // =============================


        await updateDoc(
            userRef,
            {

                balance:
                Number(user.balance) - amount,


                activePlan:{

                    planName:planName,

                    investmentAmount:amount,

                    dailyProfit:dailyProfit,

                    status:"Active",

                    startDate:
                    new Date().toISOString()

                }

            }
        );







        // =============================
        // REFERRAL REWARD 20%
        // FIRST INVESTMENT ONLY
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



            const referralSnapshot =
            await getDocs(referralQuery);



            if(!referralSnapshot.empty){



                const referrerDoc =
                referralSnapshot.docs[0];


                const referrer =
                referrerDoc.data();



                const reward =
                amount * 0.20;



                const referrerRef =
                doc(
                    db,
                    "users",
                    referrerDoc.id
                );




                await updateDoc(
                    referrerRef,
                    {

                        balance:
                        Number(referrer.balance || 0)
                        + reward,


                        referralBonus:
                        Number(referrer.referralBonus || 0)
                        + reward

                    }
                );





                await addDoc(
                    collection(db,"referralRewards"),
                    {

                        referrerId:
                        referrerDoc.id,


                        referredUser:
                        currentUser.uid,


                        investmentAmount:
                        amount,


                        reward:
                        reward,


                        createdAt:
                        new Date().toISOString()

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

        alert(error.message);


    }


    finally{


        button.disabled = false;

        button.innerText =
        "Invest Now";


    }


}
