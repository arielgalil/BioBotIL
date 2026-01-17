export const API_KEY = process.env.API_KEY || ""; 
export const RLM = "\u200f"; // Right-to-Left Mark

export const MODELS = {
  TEXT: 'gemini-2.5-flash-lite-preview-09-2025',
  LOGIC: 'gemini-2.5-flash-lite-preview-09-2025',
};

export const PRICING = {
  [MODELS.TEXT]: {
    input: 0.075 / 1_000_000,
    output: 0.30 / 1_000_000,
  }
};

export const STORAGE_KEYS = {
  MESSAGES: 'biobot_messages',
  THEME: 'biobot_theme',
  USER_ID: 'biobot_user_id',
  USER_TRACKED: 'biobot_remote_tracked',
};
