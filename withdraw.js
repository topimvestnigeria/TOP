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


// Elements

const bankForm = document.getElementById("bankForm");
const savedBankBox = document.getElementById("savedBankBox");

const saveBankBtn = document.getElementById("saveBankBtn");
const changeBankBtn = document.getElementById("changeBankBtn");



// Check user login

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;

    loadBankAccount();

});




// Load saved bank

async function loadBankAccount(){

    const userRef = doc(db,"users",currentUser.uid);

    const snap = await getDoc(userRef);


    if(snap.exists()){

        const data = snap.data();


        if(
            data.bankName &&
            data.accountNumber &&
            data.accountName
        ){

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

}




// Save bank account

saveBankBtn.addEventListener("click", async()=>{


    const bank =
    document.getElementById("bank").value;


    const accountNumber =
    document.getElementById("accountNumber").value.trim();


    const accountName =
    document.getElementById("accountName").value.trim();



    if(!bank || !accountNumber || !accountName){

        alert("Complete bank information.");

        return;

    }



    await updateDoc(
        doc(db,"users",currentUser.uid),
        {

            bankName: bank,

            accountNumber: accountNumber,

            accountName: accountName

        }
    );


    alert("Bank account saved successfully.");


    location.reload();


});




// Change bank

changeBankBtn.addEventListener("click",()=>{

    savedBankBox.style.display="none";

    bankForm.style.display="block";

});





// Submit withdrawal

document.getElementById("withdrawBtn")
.addEventListener("click", async()=>{


    try{


        const amount =
        Number(document.getElementById("amount").value);



        const userSnap =
        await getDoc(
            doc(db,"users",currentUser.uid)
        );


        const userData = userSnap.data();



        if(
            !userData.bankName ||
            !userData.accountNumber ||
            !userData.accountName
        ){

            alert("Please save your bank account first.");

            return;

        }



        if(amount <=0){

            alert("Enter a valid amount.");

            return;

        }



        await addDoc(
            collection(db,"withdrawRequests"),
            {

                userId: currentUser.uid,

                email: currentUser.email,

                amount: amount,

                bank: userData.bankName,

                accountNumber: userData.accountNumber,

                accountName: userData.accountName,

                status:"Pending",

                createdAt:new Date().toISOString()

            }
        );



        document.getElementById("status").innerText =
        "✅ Withdrawal request submitted successfully!";



        document.getElementById("amount").value="";



    }
    catch(error){

        console.log(error);

        alert(error.message);

    }


});
