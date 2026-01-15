# Track Plan: PWA & PostCSS Migration

## Phase 1: Environment & PostCSS Setup
- [ ] Task: Project - Remove Tailwind CDN
  - [ ] Subtask: Remove the `<script src="https://cdn.tailwindcss.com"></script>` tag from `index.html`.
  - [ ] Subtask: Verify that styles break (Red phase for CSS setup).
- [ ] Task: Infrastructure - Install PostCSS & Tailwind
  - [ ] Subtask: Install `tailwindcss`, `postcss`, `autoprefixer` via npm.
  - [ ] Subtask: Initialize Tailwind and PostCSS config files (`npx tailwindcss init -p`).
- [ ] Task: Infrastructure - Configure Tailwind Build
  - [ ] Subtask: Update `tailwind.config.ts` to include `content` paths for all React components.
  - [ ] Subtask: Create a `src/index.css` file with `@tailwind base;`, `@tailwind components;`, and `@tailwind utilities;`.
  - [ ] Subtask: Import `index.css` in `index.tsx`.
- [ ] Task: Conductor - User Manual Verification 'Environment & PostCSS Setup' (Protocol in workflow.md)

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
