# Tech Stack - BIO-Bot

## Frontend
- **Framework:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (integrated via `@tailwindcss/vite`)
- **Icon Library:** Lucide React

## AI & Logic
- **SDK:** Google Generative AI SDK (`@google/genai`)
- **Models:** Gemini 2.5 Flash / Gemini 2.5 Flash Lite (Preview)

## Infrastructure
- **Build Tool:** Vite
- **Hosting:** Firebase Hosting
- **Testing:** 
  - **Unit Testing:** Vitest
  - **Component Testing:** React Testing Library
- **Environment Management:** Vite `.env` loading (mapped to `process.env.API_KEY`)
