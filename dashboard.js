import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    try {

        // ==========================
        // USER DATA
        // ==========================

        const userRef = doc(db, "users", user.uid);

        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {

            alert("User account not found.");

            return;

        }

        const data = userSnap.data();


        // ==========================
        // WELCOME MESSAGE
        // ==========================

        document.getElementById("welcomeUser").innerText =
            `Welcome, ${data.fullname} 👋`;

        document.getElementById("balance").innerText =
            "₦" + Number(data.balance || 0).toLocaleString();


        // ==========================
        // REFERRAL CODE
        // ==========================

        const referralElement =
            document.getElementById("referralCode");

        if (referralElement) {

            referralElement.innerText =
                data.referralCode || "Not Available";

        }


        const copyBtn =
            document.getElementById("copyReferralBtn");

        if (copyBtn) {

            copyBtn.addEventListener("click", async () => {

                try {

                    await navigator.clipboard.writeText(
                        data.referralCode || ""
                    );

                    alert("Referral code copied successfully!");

                }

                catch {

                    alert("Unable to copy referral code.");

                }

            });

        }


        // ==========================
        // ACTIVE INVESTMENT
        // ==========================

        const investmentContainer =
            document.getElementById("activeInvestment");

        if (investmentContainer) {

            if (!data.activePlan) {

                investmentContainer.innerHTML = `

                    <p>No active investment yet.</p>

                `;

            }

            else {

                investmentContainer.innerHTML = `

                    <div class="transaction-card">

                        <h3>${data.activePlan.planName}</h3>

                        <p>

                            <strong>Investment:</strong>

                            ₦${Number(data.activePlan.investmentAmount).toLocaleString()}

                        </p>

                        <p>

                            <strong>Daily Profit:</strong>

                            ₦${Number(data.activePlan.dailyProfit).toLocaleString()}

                        </p>

                        <p>

                            <strong>Total Profit:</strong>

                            ₦${Number(data.activePlan.totalProfit || 0).toLocaleString()}

                        </p>

                        <p>

                            <strong>Status:</strong>

                            🟢 ${data.activePlan.status}

                        </p>

                        <p>

                            <strong>Started:</strong>

                            ${new Date(data.activePlan.startDate).toLocaleDateString()}

                        </p>

                    </div>

                `;

            }

        }

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

});
