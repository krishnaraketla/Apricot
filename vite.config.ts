import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: './', // This is important for Electron to load resources correctly
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: undefined, // Ensures smaller bundle sizes
      }
    }
  },
  server: {
    port: 5173,
    strictPort: true, // Don't try other ports if 5173 is in use
  },
}); 