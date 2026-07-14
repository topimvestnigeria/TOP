import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    addDoc,
    updateDoc,
    serverTimestamp,
    increment
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

let currentUser = null;

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;

    await loadPlans();

});

async function loadPlans() {

    const plansContainer =
        document.getElementById("plansContainer");

    plansContainer.innerHTML = "";

    const q = query(
        collection(db, "plans"),
        where("active", "==", true)
    );

    const snapshot = await getDocs(q);

    snapshot.forEach((planDoc) => {

        const plan = planDoc.data();

        plansContainer.innerHTML += `

        <div class="plan-card">

            <h3>${plan.name}</h3>

            <p>
                Investment
                <strong>
                    ₦${Number(plan.amount).toLocaleString()}
                </strong>
            </p>

            <p>
                Daily Profit
                <strong>
                    ₦${Number(plan.dailyProfit).toLocaleString()}
                </strong>
            </p>

            <p>
                Duration
                <strong>
                    ${plan.duration} Days
                </strong>
            </p>

            <button
                class="plan-btn"
                onclick="invest('${planDoc.id}')">

                Invest Now

            </button>

        </div>

        `;

    });

}

async function invest(planId) {

    try {

        // Load selected plan
        const planRef = doc(db, "plans", planId);
        const planSnap = await getDoc(planRef);

        if (!planSnap.exists()) {
            alert("Investment plan not found.");
            return;
        }

        const plan = planSnap.data();

        const amount = Number(plan.amount);
        const dailyProfit = Number(plan.dailyProfit);
        const duration = Number(plan.duration);
        const planName = plan.name;

        // Get current user
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            alert("User account not found.");
            return;
        }

        const userData = userSnap.data();

        // Wallet balance check
        if ((userData.balance || 0) < amount) {
            alert("Insufficient wallet balance.");
            return;
        }

        // Check active investment
        const investmentQuery = query(
            collection(db, "investments"),
            where("userId", "==", currentUser.uid),
            where("status", "==", "Active")
        );

        const investmentSnap = await getDocs(investmentQuery);

        if (!investmentSnap.empty) {
            alert("You already have an active investment.");
            return;
        }

        // Deduct wallet
        await updateDoc(userRef, {
            balance: increment(-amount)
        });

        // Calculate end date
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + duration);

        // Create investment
        await addDoc(collection(db, "investments"), {

            userId: currentUser.uid,

            planId,

            planName,

            investmentAmount: amount,

            dailyProfit,

            duration,

            daysPaid: 0,

            remainingDays: duration,

            totalProfit: 0,

            status: "Active",

            createdAt: serverTimestamp(),

            lastProfitDate: serverTimestamp(),

            endDate

        });

        alert("Investment activated successfully!");

        window.location.href = "dashboard.html";

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

}

window.invest = invest;
