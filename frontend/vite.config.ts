import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import topLevelAwait from 'vite-plugin-top-level-await'

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // 👈 THIS is critical for Tauri packaged apps
  plugins: [
    react(),
    topLevelAwait(),
  ],
  build: {
    target: ['es2021', 'chrome100', 'safari15'],
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    copyPublicDir: true,
    // WASM assets no longer needed (removed Argon2)
    rollupOptions: {
      // Bundle everything so paths stay relative in production
      external: () => false,
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  optimizeDeps: {
    // No exclusions needed
  },
  server: {
    host: '127.0.0.1',
    strictPort: true,
    port: 1420,
  },
})
