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

    } catch (error) {

        console.error(error);
        alert(error.message);

    }

});
