# Track Plan: Maintenance & Optimization

## Phase 1: Model Integration Verification
- [x] Task: Service - Verify Model Configuration (4a0577d)
  - [ ] Subtask: Inspect `services/geminiService.ts` to confirm `MODEL_TEXT` and `MODEL_LOGIC` constants are set to `gemini-2.5-flash-lite-preview-09-2025`.
  - [ ] Subtask: Add temporary logging to `streamChatResponse` to capture the raw model name being used during execution.
- [x] Task: Service - Test Text Streaming (18be003)
  - [ ] Subtask: Create a manual test script or use a dev component to trigger a chat request and verify the streaming response content.
- [~] Task: Conductor - User Manual Verification 'Model Integration Verification' (Protocol in workflow.md)

## Phase 2: Widget Generation Stability
- [ ] Task: Service - Verify JSON Schema Compatibility
  - [ ] Subtask: Review the `generateWidgets` function. Ensure the `responseSchema` definition aligns with the latest Gemini API specs for structured output.
  - [ ] Subtask: Implement a unit test or dev-mode trigger to call `generateWidgets` 5 times with different topics to ensure consistent JSON parsing.
- [ ] Task: UI - Validate Widget Rendering
  - [ ] Subtask: Verify that the generated JSON data (Knowledge Questions, Causal Chains) is correctly rendered by the `GameWidgets` component without React errors.
- [ ] Task: Conductor - User Manual Verification 'Widget Generation Stability' (Protocol in workflow.md)

## Phase 3: Error Handling & Cleanup
- [ ] Task: Service - Refine Error Handling
  - [ ] Subtask: Update the `try-catch` blocks in `geminiService.ts` to specifically handle "Model Not Found" or new rate limit codes that might differ for preview models.
- [ ] Task: Cleanup - Remove Debug Logs
  - [ ] Subtask: Remove the temporary logging added in Phase 1.
- [ ] Task: Conductor - User Manual Verification 'Error Handling & Cleanup' (Protocol in workflow.md)
