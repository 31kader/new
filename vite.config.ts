import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { fileURLToPath } from 'url';
import {defineConfig, loadEnv} from 'vite';
import { pwaConfig } from './src/config/pwaConfig';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA(pwaConfig)
    ],
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('lucide-react')) return 'vendor-icons';
              if (id.includes('recharts') || id.includes('d3')) return 'vendor-charts';
              if (id.includes('xlsx') || id.includes('papaparse')) return 'vendor-data-utils';
              if (id.includes('@supabase') || id.includes('postgrest')) return 'vendor-supabase';
              if (id.includes('jspdf')) return 'vendor-pdf';
              if (id.includes('tesseract.js')) return 'vendor-ocr';
              if (id.includes('zxing')) return 'vendor-barcode';
              return 'vendor-base';
            }
          }
        }
      }
    },
    define: {
      // Keys are now handled exclusively on the server side via /api proxy routes
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: false,
    },
  };
});
