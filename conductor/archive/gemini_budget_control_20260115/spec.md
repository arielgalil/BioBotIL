# Specification: Gemini Budget Control & Real-time Monitoring

## 1. Overview
The BIO-Bot application utilizes the Gemini API for both conversational tutoring and interactive widget generation. To prevent unexpected financial overages due to delayed billing alerts from Google Cloud, this track implements a client-side budget monitoring system. It will maintain a cumulative cost counter in Firestore and verify the remaining budget before every API call.

## 2. Functional Requirements
- **Cumulative Cost Tracking:** Store the current total cost in a Firestore document (e.g., `config/billing`).
- **Pre-call Verification:** Before calling `streamChatResponse` or `generateWidgets`, the application must fetch the current cost and hard limit from Firestore.
- **Hard Budget Block:** If `currentCost >= hardLimit`, the API call must be blocked, and the user must receive a Hebrew error message explaining that the service is temporarily unavailable due to budget constraints.
- **Post-call Cost Update:** Immediately after a successful API response (including the final chunk of a stream), calculate the cost based on `usageMetadata` (input + output tokens) and the specific model's pricing.
- **Atomic Updates:** Use Firestore transactions or `fieldValue.increment` to ensure the cost counter is updated accurately even if multiple users are interacting simultaneously.

## 3. Technical Constraints & Costs
- **Database:** Firebase Firestore.
- **SDK:** Add `firebase/app` and `firebase/firestore`.
- **Pricing (Gemini 2.5 Flash Lite Preview):**
  - Input: $0.075 / 1M tokens (as of current known rates for Flash Lite).
  - Output: $0.30 / 1M tokens.
  - *Note: These will be defined as constants in the service for easy adjustment.*

## 4. Acceptance Criteria
- [ ] Firestore is initialized in the project.
- [ ] A `config/billing` document exists with `currentCost` and `hardLimit`.
- [ ] Chat fails gracefully with a Hebrew error when the limit is reached.
- [ ] Widget generation is skipped (with a warning) when the limit is reached.
- [ ] Every successful API call increases the `currentCost` in Firestore by the correct amount based on token usage.
- [ ] Unit tests verify the blocking logic and the calculation logic.

## 5. Out of Scope
- Automated budget resets (handled manually via Firebase Console).
- Admin UI for managing limits (handled manually via Firebase Console).
- Handling per-user limits (budget is global for the project).
