import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc,
    addDoc,
    collection
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


let currentUser = null;


// ============================
// Elements
// ============================

const bankForm = document.getElementById("bankForm");

const savedBankBox = document.getElementById("savedBankBox");

const saveBankBtn = document.getElementById("saveBankBtn");

const changeBankBtn = document.getElementById("changeBankBtn");

const withdrawBtn = document.getElementById("withdrawBtn");


// ============================
// LOGIN CHECK
// ============================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

    await loadBankAccount();

});




// ============================
// LOAD BANK
// ============================

async function loadBankAccount() {

    const userRef = doc(db, "users", currentUser.uid);

    const snap = await getDoc(userRef);

    if (!snap.exists()) return;

    const data = snap.data();

    if (
        data.bankName &&
        data.accountNumber &&
        data.accountName
    ) {

        document.getElementById("savedBank").innerText =
            data.bankName;

        document.getElementById("savedName").innerText =
            data.accountName;

        document.getElementById("savedNumber").innerText =
            data.accountNumber;

        savedBankBox.style.display = "block";

        bankForm.style.display = "none";

    }

}



// ============================
// SAVE BANK
// ============================

saveBankBtn.addEventListener("click", async () => {

    try {

        saveBankBtn.disabled = true;

        const bank =
            document.getElementById("bank").value;

        const accountNumber =
            document.getElementById("accountNumber").value.trim();

        const accountName =
            document.getElementById("accountName").value.trim();


        if (!bank || !accountNumber || !accountName) {

            throw new Error("Please complete all bank details.");

        }

        if (accountNumber.length !== 10) {

            throw new Error("Account number must be exactly 10 digits.");

        }

        await updateDoc(

            doc(db, "users", currentUser.uid),

            {

                bankName: bank,

                accountNumber: accountNumber,

                accountName: accountName

            }

        );

        alert("Bank account saved successfully.");

        location.reload();

    }

    catch (error) {

        alert(error.message);

    }

    finally {

        saveBankBtn.disabled = false;

    }

});




// ============================
// CHANGE BANK
// ============================

changeBankBtn.addEventListener("click", () => {

    savedBankBox.style.display = "none";

    bankForm.style.display = "block";

});




// ============================
// SUBMIT WITHDRAWAL
// ============================

withdrawBtn.addEventListener("click", async () => {

    try {

        withdrawBtn.disabled = true;

        const amount = Number(

            document.getElementById("amount").value

        );


        if (isNaN(amount) || amount <= 0) {
            
        if(amount < 1000){

            throw new Error("Minimum withdrawal is ₦1,000.");

}
            throw new Error("Please enter a valid withdrawal amount.");

        }


        const userRef = doc(db, "users", currentUser.uid);

        const userSnap = await getDoc(userRef);

        const userData = userSnap.data();


        if (

            !userData.bankName ||

            !userData.accountNumber ||

            !userData.accountName

        ) {

            throw new Error("Please save your bank account first.");

        }


        if (Number(userData.balance) < amount) {

            throw new Error("Insufficient wallet balance.");

        }


        await addDoc(

            collection(db, "withdrawRequests"),

            {

                userId: currentUser.uid,

                email: currentUser.email,

                amount: amount,

                bank: userData.bankName,

                accountNumber: userData.accountNumber,

                accountName: userData.accountName,

                status: "Pending",

                createdAt: new Date().toISOString()

            }

        );


        document.getElementById("status").innerHTML =

            "✅ Withdrawal request submitted successfully.<br><br>Please wait for admin approval.";


        document.getElementById("amount").value = "";

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

    finally {

        withdrawBtn.disabled = false;

    }

});
