import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBjXxfR3se-Lb1Mpk32NyaIcVkklNftce0",
    authDomain: "nexaflow-ab2fe.firebaseapp.com",
    projectId: "nexaflow-ab2fe",
    storageBucket: "nexaflow-ab2fe.appspot.com",
    messagingSenderId: "711366168687",
    appId: "1:711366168687:web:fd96d3459d29c75b263d9a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);