// Import the functions you need from the Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // For Authentication (if needed)
import { getFirestore } from "firebase/firestore"; // For Firestore (if needed)
import { getStorage } from "firebase/storage"; // For Storage (if needed)

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD6hfmsp_2aIrVfbTRAtKOSeW2lpfXFVGs",
  authDomain: "smart-inventory-cf61a.firebaseapp.com",
  projectId: "smart-inventory-cf61a",
  storageBucket: "smart-inventory-cf61a.firebaseapp.com",
  messagingSenderId: "361423125686",
  appId: "1:361423125686:web:e8b7cde835aa1907117a17",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services you plan to use
export const auth = getAuth(app); // Authentication
export const db = getFirestore(app); // Firestore Database
export const storage = getStorage(app); // Firebase Storage
