import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { PRICING } from "../config";
import { logActivity } from "./activityService";

export const calculateCost = (inputTokens: number, outputTokens: number, model: string): number => {
  const modelPricing = PRICING[model as keyof typeof PRICING];
  if (!modelPricing) {
    console.warn(`Pricing not defined for model: ${model}. Defaulting to 0.`);
    return 0;
  }
  return (inputTokens * modelPricing.input) + (outputTokens * modelPricing.output);
};

export const isBudgetAvailable = async (): Promise<boolean> => {
  try {
    const snapshot = await getDoc(doc(db, "config", "billing"));
    if (!snapshot.exists()) {
      console.warn("Billing configuration not found. Blocking by default.");
      return false;
    }
    const { currentCost, hardLimit } = snapshot.data();
    return currentCost < hardLimit;
  } catch (error) {
    console.error("Error checking budget:", error);
    return false;
  }
};

/**
 * Updates cumulative cost by logging an activity.
 * The actual increment happens in Cloud Functions based on the log.
 */
export const updateCumulativeCost = async (amount: number, metadata?: { userId: string, model: string, inputTokens: number, outputTokens: number }): Promise<void> => {
  if (amount <= 0 || !metadata) return;
  // We log the activity which triggers the Cloud Function to update the budget document securely.
  await logActivity({
    type: 'message_received',
    ...metadata
  });
};
