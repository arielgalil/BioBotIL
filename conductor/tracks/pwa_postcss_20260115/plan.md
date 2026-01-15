# Track Plan: PWA & PostCSS Migration

## Phase 1: Environment & PostCSS Setup [checkpoint: 8fb1998]
- [x] Task: Project - Remove Tailwind CDN (e76fcb5)
- [x] Task: Infrastructure - Install PostCSS & Tailwind (645b13b)
- [x] Task: Infrastructure - Configure Tailwind Build (22f6e6e)
- [x] Task: Conductor - User Manual Verification 'Environment & PostCSS Setup' (Protocol in workflow.md) (8fb1998)

## Phase 2: Vite PWA Plugin Integration
- [ ] Task: Infrastructure - Install & Configure Vite PWA Plugin
  - [ ] Subtask: Install `vite-plugin-pwa`.
  - [ ] Subtask: Configure `vite.config.ts` to use the PWA plugin with `registerType: 'autoUpdate'`.
  - [ ] Subtask: Define the web app manifest within the plugin configuration (icons, theme colors, standalone mode).
- [ ] Task: Infrastructure - Migrate Static Manifest
  - [ ] Subtask: Remove old `manifest.json` and `sw.js` if they conflict with the plugin-generated ones.
  - [ ] Subtask: Ensure all icon assets referenced in the manifest exist in the `public` folder.
- [ ] Task: Conductor - User Manual Verification 'Vite PWA Plugin Integration' (Protocol in workflow.md)

## Phase 3: UI Implementation & Metadata Cleanup
- [ ] Task: UI - Fix Deprecated Metadata
  - [ ] Subtask: Update `index.html` to replace `apple-mobile-web-app-capable` with `mobile-web-app-capable`.
  - [ ] Subtask: Remove any other deprecated meta tags or console-warning-triggering elements.
- [ ] Task: UI - Implement Install Prompt Logic
  - [ ] Subtask: Create a custom hook or state in `App.tsx` to listen for the `beforeinstallprompt` event.
  - [ ] Subtask: Implement a visually appealing "Install App" button that only appears when the event is captured.
- [ ] Task: Conductor - User Manual Verification 'UI Implementation & Metadata Cleanup' (Protocol in workflow.md)

## Phase 4: Final Verification & Audit
- [ ] Task: Testing - PWA Audit & Offline Verification
  - [ ] Subtask: Build the project (`npm run build`) and preview it to verify the service worker is active.
  - [ ] Subtask: Test "Offline Mode" by disabling network in dev tools and reloading the app shell.
  - [ ] Subtask: Run a Lighthouse PWA audit and ensure all core checks pass.
- [ ] Task: Conductor - User Manual Verification 'Final Verification & Audit' (Protocol in workflow.md)
