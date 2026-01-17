import { STORAGE_KEYS } from "../config";
import { logActivity } from "./activityService";

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
  if (localStorage.getItem(STORAGE_KEYS.USER_TRACKED)) return;

  // Log session start - Cloud Function will handle doc creation and global increment
  await logActivity({ type: 'session_start', userId });
  localStorage.setItem(STORAGE_KEYS.USER_TRACKED, "true");
};

export const trackMessageSent = async () => {
    await logActivity({ type: 'message_sent', userId: getUserId() });
};

export const trackMessageReceived = async () => {
    // Note: trackMessageReceived is now mostly handled via updateCumulativeCost 
    // in the bot response flow to avoid double logging.
    // If called directly, we just log the type.
    await logActivity({ type: 'message_received', userId: getUserId() });
};
