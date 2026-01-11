import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vike from 'vike/plugin';
import { resolve } from 'path';
import { config as dotenvConfig } from 'dotenv';

// Load .dev.vars for local development (Cloudflare Workers env file format)
dotenvConfig({ path: '.dev.vars' });

export default defineConfig({
  plugins: [react(), vike()],
  // Wrangler proxies to Vite, so suppress the misleading localhost:5173 message
  logLevel: 'warn',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@pages': resolve(__dirname, './src/pages'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@utils': resolve(__dirname, './src/utils'),
      '@types': resolve(__dirname, './src/types'),
      '@styles': resolve(__dirname, './src/styles'),
    },
  },
  build: {
    // Target modern browsers for smaller bundles
    target: 'es2020',
    // Disable source maps for smaller production builds
    sourcemap: false,
  },
  // Drop console in production
  esbuild: {
    drop: ['console', 'debugger'],
  },
});
