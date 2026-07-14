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
