import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: "https://biobotil-default-rtdb.firebaseio.com",
  projectId: "biobotil",
  storageBucket: "biobotil.firebasestorage.app",
  messagingSenderId: "181222177438",
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: "G-ZL8QWH3LE8"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
