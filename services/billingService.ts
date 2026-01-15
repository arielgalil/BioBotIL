import { db } from "./firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";

// Pricing for Gemini 2.5 Flash Lite Preview (USD per 1M tokens)
// Input: $0.075 / 1M tokens
// Output: $0.30 / 1M tokens
const PRICING = {
  'gemini-2.5-flash-lite-preview-09-2025': {
    input: 0.075 / 1_000_000,
    output: 0.30 / 1_000_000,
  }
};

/**
 * Calculates the cost of an API call based on token usage and model.
 */
export const calculateCost = (inputTokens: number, outputTokens: number, model: string): number => {
  const modelPricing = PRICING[model as keyof typeof PRICING];
  if (!modelPricing) {
    console.warn(`Pricing not defined for model: ${model}. Defaulting to 0.`);
    return 0;
  }
  
  return (inputTokens * modelPricing.input) + (outputTokens * modelPricing.output);
};

/**
 * Checks if there is remaining budget for API calls.
 */
export const isBudgetAvailable = async (): Promise<boolean> => {
  try {
    const billingDoc = doc(db, "config", "billing");
    const snapshot = await getDoc(billingDoc);
    
    if (!snapshot.exists()) {
      console.warn("Billing configuration not found. Blocking by default.");
      return false;
    }
    
    const { currentCost, hardLimit } = snapshot.data();
    return currentCost < hardLimit;
  } catch (error) {
    console.error("Error checking budget:", error);
    // In case of error (e.g. offline), we might want to fail-safe (block) or fail-open.
    // Given this is budget control, fail-safe (false) is safer for the owner.
    return false;
  }
};

/**
 * Updates the cumulative cost in Firestore atomically.
 */
export const updateCumulativeCost = async (amount: number): Promise<void> => {
  if (amount <= 0) return;
  
  try {
    const billingDoc = doc(db, "config", "billing");
    await updateDoc(billingDoc, {
      currentCost: increment(amount)
    });
  } catch (error) {
    console.error("Failed to update cumulative cost:", error);
    // Note: We don't throw here to avoid crashing the user experience after a successful AI call,
    // but it should be logged for monitoring.
  }
};
