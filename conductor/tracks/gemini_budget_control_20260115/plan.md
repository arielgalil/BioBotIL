# Plan: Gemini Budget Control & Real-time Monitoring

This plan implements a client-side budget tracking and enforcement system using Firebase Firestore to prevent Gemini API overages.

## Phase 1: Infrastructure & Firebase Setup
- [x] Task: Install Firebase dependencies (`firebase`) 30cad20
- [ ] Task: Initialize Firebase app and Firestore instance in a new `services/firebase.ts` file
- [ ] Task: Create a setup script or documentation for creating the `config/billing` document in Firestore
- [ ] Task: Conductor - User Manual Verification 'Infrastructure & Firebase Setup' (Protocol in workflow.md)

## Phase 2: Billing Service Implementation (TDD)
- [ ] Task: Create `services/billingService.ts` with cost calculation logic and Firestore interaction
- [ ] Task: Write failing tests for `calculateCost(usage, model)` to ensure correct pricing application
- [ ] Task: Implement `calculateCost` to pass tests
- [ ] Task: Write failing tests for `isBudgetAvailable()` (mocking Firestore)
- [ ] Task: Implement `isBudgetAvailable` and `updateCumulativeCost(amount)`
- [ ] Task: Conductor - User Manual Verification 'Billing Service Implementation' (Protocol in workflow.md)

## Phase 3: Gemini Service Integration
- [ ] Task: Integrate budget check into `streamChatResponse` in `services/geminiService.ts`
- [ ] Task: Integrate cost update into `streamChatResponse` after stream completion using `usageMetadata`
- [ ] Task: Integrate budget check into `generateWidgets` in `services/geminiService.ts`
- [ ] Task: Integrate cost update into `generateWidgets` after successful JSON response
- [ ] Task: Write integration tests in `services/geminiService.test.ts` to verify API calls are blocked when budget is exhausted
- [ ] Task: Conductor - User Manual Verification 'Gemini Service Integration' (Protocol in workflow.md)

## Phase 4: UI & Error Handling
- [ ] Task: Update `App.tsx` to handle the specific "Budget Exceeded" error thrown by the service
- [ ] Task: Implement a Hebrew error message/toast for budget exhaustion: "מצטערים, המערכת הגיעה למגבלת התקציב היומית שלה. נסו שוב מאוחר יותר."
- [ ] Task: Conductor - User Manual Verification 'UI & Error Handling' (Protocol in workflow.md)
