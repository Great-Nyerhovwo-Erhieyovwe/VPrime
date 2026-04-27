import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist', // Output directory for the build
    chunkSizeWarningLimit: 1024000, // Increase the chunk size warning limit (in KB)
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          icons: ['react-icons']
          if (id.includes('node_modules')) {
            return 'vendor'; // All node_modules will be bundled into a single 'vendor' chunk
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js', // Custom chunk file naming
      }
    }
  }
})
