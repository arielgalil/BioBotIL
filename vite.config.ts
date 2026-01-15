import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        tailwindcss(),
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          devOptions: {
            enabled: true
          },
          workbox: {
            skipWaiting: true,
            clientsClaim: true,
          },
          manifest: {
            name: 'BIOבוט - המורה הפרטי שלך לביולוגיה',
            short_name: 'BIOבוט',
            description: 'למידת ביולוגיה אינטראקטיבית לתלמידי תיכון',
            theme_color: '#10b981',
            background_color: '#ffffff',
            display: 'standalone',
            dir: 'rtl',
            lang: 'he',
            icons: [
              {
                src: 'https://img.icons8.com/fluency/192/biotech.png',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: 'https://img.icons8.com/fluency/512/biotech.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              }
            ]
          }
        })
      ],
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              'vendor-ai': ['@google/genai'],
              'vendor-ui': ['lucide-react', 'react', 'react-dom'],
            },
          },
        },
        chunkSizeWarningLimit: 800,
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
