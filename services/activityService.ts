import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const logActivity = async (data: { 
  type: 'session_start' | 'message_sent' | 'message_received', 
  userId: string, 
  model?: string, 
  inputTokens?: number, 
  outputTokens?: number 
}) => {
  try {
    await addDoc(collection(db, "activity_logs"), {
      ...data,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};
