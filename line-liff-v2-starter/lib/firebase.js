import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAyW0U3Q8WTnriP83uV1OstwqueCjh7gIO8",
  authDomain: "soranomori-life.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "soranomori-life",
  storageBucket: "soranomori-life.firebasestorage.app",
  messagingSenderId: "127658863597",
  appId: "1:127658863597:web:dbe3da38e71d66cd9e15e4",
  measurementId: "G-7TS90TFBBJ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;