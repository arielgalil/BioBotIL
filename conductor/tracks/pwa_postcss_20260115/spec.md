# Track Spec: PWA & PostCSS Migration

## 1. Overview
Transform BIO-Bot into a professional Progressive Web App (PWA) with full offline capabilities and a custom installation experience. Simultaneously migrate the styling pipeline from Tailwind CDN to a proper PostCSS-based build process to resolve performance warnings and adhere to production best practices.

## 2. Functional Requirements
- **PostCSS Migration:**
  - Remove the Tailwind CDN script.
  - Install and configure `tailwindcss`, `postcss`, `autoprefixer`.
  - Integrate Tailwind into the Vite build pipeline.
- **PWA Implementation (Vite PWA Plugin):**
  - Integrate `vite-plugin-pwa` with Workbox for automated service worker generation.
  - Configure `manifest.json` with appropriate icons, colors, and `display: standalone`.
  - Implement an "Automatic Trigger" for the install prompt (custom button visible only when installable).
  - Ensure offline support for core application shell (JS, CSS, HTML).
- **Metadata & Cleanup:**
  - Replace deprecated `<meta name="apple-mobile-web-app-capable">` with modern `<meta name="mobile-web-app-capable">`.
  - Address production console warnings regarding Tailwind and metadata.

## 3. Non-Functional Requirements
- **Performance:** Reduced initial load time by removing CDN dependencies.
- **Reliability:** The app should be accessible even with intermittent or no internet connection (offline shell).
- **Standards Adherence:** Follow modern PWA and CSS build standards.

## 4. Acceptance Criteria
1. No "cdn.tailwindcss.com" warnings appear in the console.
2. Tailwind CSS styles are correctly applied and bundled in the production build.
3. The browser detects the app as installable (Lighthouse PWA check passes).
4. A custom install prompt/button appears when the `beforeinstallprompt` event fires.
5. The application shell loads successfully when the device is offline.
6. The deprecated meta tag warning is resolved.

## 5. Out of Scope
- Offline AI Chat (AI processing requires an active internet connection).
- Push Notifications.
