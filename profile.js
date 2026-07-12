import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
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

        const userRef = doc(db, "users", user.uid);

        const userSnap = await getDoc(userRef);


        if (userSnap.exists()) {

            const data = userSnap.data();


            document.getElementById("fullname").textContent =
                data.fullname || "No Name";


            document.getElementById("email").textContent =
                data.email || user.email;


            document.getElementById("balance").textContent =
                Number(data.balance || 0).toLocaleString();

        } else {

            alert("User profile not found.");

        }


    } catch (error) {

        console.error(error);

        alert(error.message);

    }

});



const logoutBtn = document.getElementById("logoutBtn");


logoutBtn.addEventListener("click", async () => {

    try {

        await signOut(auth);

        window.location.href = "login.html";


    } catch (error) {

        console.error(error);

        alert(error.message);

    }

});
