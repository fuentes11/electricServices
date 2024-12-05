// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDg0l9_4zp_7rCOtwWyH0XLhENGK4nCu8Y",
  authDomain: "hypercraft-753ae.firebaseapp.com",
  projectId: "hypercraft-753ae",
  storageBucket: "hypercraft-753ae.firebasestorage.app",
  messagingSenderId: "73078138037",
  appId: "1:73078138037:web:08b56071ef74848be28afc"
    
  };

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore y Storage
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
