# Track Spec: Maintenance & Optimization

## 1. Goal
Refine the integration of the new `gemini-2.5-flash-lite-preview-09-2025` model and ensure all educational widgets are generating correctly under the new logic.

## 2. Core Requirements
- **Model Verification:** Confirm that `gemini-2.5-flash-lite-preview-09-2025` is correctly called in both text streaming and widget generation.
- **Widget Logic:** Test and verify that the widget generation prompt is compatible with the new model version (checking for schema adherence and logic quality).
- **Error Handling:** Ensure robust fallback mechanisms if the preview model is unstable.
- **Performance:** Check latency and response times with the new model.

## 3. User Stories
- As a **developer**, I want to ensure the new AI model is working correctly so that users don't experience crashes or empty responses.
- As a **student**, I want the interactive widgets (quizzes, causal chains) to be accurate and relevant to the chat topic.

## 4. Technical Considerations
- **API Key:** Ensure the `.env` configuration (set up previously) is securely propagating to the service.
- **JSON Schema:** The new model might handle JSON schemas differently; we need to verify the `responseSchema` structure in `geminiService.ts`.
- **Rate Limits:** Preview models often have stricter rate limits; monitor for 429 errors.
