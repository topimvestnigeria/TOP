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

        document.getElementById("welcomeUser").innerText =
            `Welcome, ${data.fullname} 👋`;

        document.getElementById("balance").innerText =
            "₦" + Number(data.balance).toLocaleString();




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

                    alert("Referral code copied!");

                } catch {

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

            const investmentQuery = query(

                collection(db, "investments"),

                where("userId", "==", user.uid),

                where("status", "==", "Active")

            );

            const investmentSnapshot =
                await getDocs(investmentQuery);

            if (investmentSnapshot.empty) {

                investmentContainer.innerHTML = `

                    <p>No active investment yet.</p>

                `;

            }

            else {

                investmentSnapshot.forEach((document) => {

                    const investment = document.data();

                    investmentContainer.innerHTML = `

                        <div class="transaction-card">

                            <h3>${investment.planName}</h3>

                            <p>
                                <strong>Investment:</strong>

                                ₦${Number(investment.investmentAmount).toLocaleString()}
                            </p>

                            <p>
                                <strong>Daily Profit:</strong>

                                ₦${Number(investment.dailyProfit).toLocaleString()}
                            </p>

                            <p>

                                <strong>Status:</strong>

                                🟢 ${investment.status}

                            </p>

                        </div>

                    `;

                });

            }

        }

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

});
