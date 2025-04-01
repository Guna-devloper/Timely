// Import Firebase functions
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCEUWawRsnXYliAsvGq7XPLDyDUzTuF3eA",
  authDomain: "timely-com.firebaseapp.com",
  projectId: "timely-com",
  storageBucket: "timely-com.appspot.com", // Fixed storage bucket URL
  messagingSenderId: "396888787549",
  appId: "1:396888787549:web:8812e40e443f1e93c7dbb4",
  measurementId: "G-QEMSFD6G3J",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Export Firebase instances
export { app, analytics, auth, db };
