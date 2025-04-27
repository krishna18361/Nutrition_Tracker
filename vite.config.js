import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Ensure environment variables are properly passed
  define: {
    // Make environment variables available to client code 
    // This allows import.meta.env.VITE_API_URL to work correctly
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
  },
  server: {
    // Development server settings
    port: 5173,
    // Allow connections from local network for testing on other devices
    host: '0.0.0.0', 
    // Configure proxy for local development
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  build: {
    // Optimize build for production
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    chunkSizeWarningLimit: 1600,
  },
});