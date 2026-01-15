import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "biobotil",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function setupBilling() {
  console.log("Setting up billing configuration in Firestore...");
  
  const billingDoc = doc(db, "config", "billing");
  
  try {
    await setDoc(billingDoc, {
      currentCost: 0,
      hardLimit: 5.0, // $5.00 limit
      lastReset: new Date().toISOString()
    }, { merge: true });
    
    console.log("Successfully initialized config/billing document.");
    process.exit(0);
  } catch (error) {
    console.error("Error setting up billing:", error);
    process.exit(1);
  }
}

setupBilling();
