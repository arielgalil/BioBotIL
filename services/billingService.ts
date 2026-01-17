import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { PRICING } from "../config";

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

// Note: In this project, client-side writes to config/billing are forbidden by Firestore rules.
// Billing tracking is likely handled by a backend trigger/Cloud Function.
export const updateCumulativeCost = async (amount: number): Promise<void> => {
  // We keep the function signature to avoid breaking callers, 
  // but we remove the forbidden write operation.
  if (amount <= 0) return;
  // console.log(`[Billing] Skip client-side update of ${amount} (Forbidden by rules)`);
};
