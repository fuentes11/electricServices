// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDAkUMJVmhvTP_rHZC5S9JrNkXbTMlk5Fg",
    authDomain: "electricservices-919b3.firebaseapp.com",
    projectId: "electricservices-919b3",
    storageBucket: "electricservices-919b3.appspot.com",
    messagingSenderId: "254430779868",
    appId: "1:254430779868:web:2515dcee70cbeb58fd1719",
    measurementId: "G-JYJ1P5E904"
  };

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore y Storage
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
