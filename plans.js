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

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

});


// =============================
// INVEST BUTTONS
// =============================

document.querySelectorAll(".investBtn").forEach((button) => {

    button.addEventListener("click", () => invest(button));

});


// =============================
// INVEST FUNCTION
// =============================

async function invest(button) {

    button.disabled = true;
    button.innerText = "Processing...";

    try {

        if (!currentUser) {

            throw new Error("Please login first.");

        }

        const planName = button.dataset.name;

        const amount = Number(button.dataset.amount);

        const dailyProfit = Number(button.dataset.profit);



        // =============================
        // USER DATA
        // =============================

        const userRef = doc(db, "users", currentUser.uid);

        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {

            throw new Error("User account not found.");

        }

        const user = userSnap.data();



        // =============================
        // WALLET CHECK
        // =============================

        if (Number(user.balance) < amount) {

            throw new Error("Insufficient wallet balance.");

        }



        // =============================
        // ACTIVE PLAN CHECK
        // =============================

        const activeQuery = query(

            collection(db, "investments"),

            where("userId", "==", currentUser.uid),

            where("status", "==", "Active")

        );

        const activeSnapshot = await getDocs(activeQuery);

        if (!activeSnapshot.empty) {

            throw new Error("You already have an active investment. Upgrade will be available soon.");

        }



        // =============================
        // DEDUCT WALLET
        // =============================

        await updateDoc(userRef, {

            balance: Number(user.balance) - amount,

            activePlan: {

                planName: planName,

                investmentAmount: amount,

                dailyProfit: dailyProfit,

                status: "Active",

                startDate: new Date().toISOString(),

                totalProfit: 0

            }

        });



        // =============================
        // SAVE HISTORY
        // =============================

        await addDoc(

            collection(db, "investments"),

            {

                userId: currentUser.uid,

                email: currentUser.email,

                planName: planName,

                investmentAmount: amount,

                dailyProfit: dailyProfit,

                status: "Active",

                totalProfit: 0,

                createdAt: new Date().toISOString()

            }

        );



        alert("🎉 Investment activated successfully!");

        window.location.href = "dashboard.html";

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

    finally {

        button.disabled = false;

        button.innerText = "Invest Now";

    }

}
