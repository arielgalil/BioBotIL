import { db } from "./firebase";
import { doc, setDoc, updateDoc, increment, getDoc, serverTimestamp } from "firebase/firestore";
import { STORAGE_KEYS } from "../config";

const STATS_DOC_REF = doc(db, "stats", "global");

const getUserId = (): string => {
  let userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
  if (!userId) {
    userId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
  }
  return userId;
};

export const initializeUserTracking = async () => {
  const userId = getUserId();
  const userDocRef = doc(db, "users", userId);
  if (localStorage.getItem(STORAGE_KEYS.USER_TRACKED)) return;

  try {
    const userSnapshot = await getDoc(userDocRef);
    if (!userSnapshot.exists()) {
      await setDoc(userDocRef, { firstSeen: serverTimestamp(), lastActive: serverTimestamp(), messagesSent: 0, messagesReceived: 0 });
      await updateDoc(STATS_DOC_REF, { totalUsers: increment(1) }).catch(async () => {
        await setDoc(STATS_DOC_REF, { totalUsers: 1, totalMessagesSent: 0, totalMessagesReceived: 0 });
      });
    }
    localStorage.setItem(STORAGE_KEYS.USER_TRACKED, "true");
  } catch (e) {}
};

export const trackMessageSent = async () => {
    const userDocRef = doc(db, "users", getUserId());
    try {
        await setDoc(userDocRef, { messagesSent: increment(1), lastActive: serverTimestamp() }, { merge: true });
        await updateDoc(STATS_DOC_REF, { totalMessagesSent: increment(1) });
    } catch (e) {}
};

export const trackMessageReceived = async () => {
    const userDocRef = doc(db, "users", getUserId());
    try {
        await setDoc(userDocRef, { messagesReceived: increment(1), lastActive: serverTimestamp() }, { merge: true });
        await updateDoc(STATS_DOC_REF, { totalMessagesReceived: increment(1) });
    } catch (e) {}
};
