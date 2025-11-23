import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // 👈 THIS is critical for Tauri packaged apps
  plugins: [react(), wasm(), topLevelAwait()],
  build: {
    target: ['es2021', 'chrome100', 'safari15'],
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    copyPublicDir: true,
    rollupOptions: {
      external: (id) => {
        // Externalize argon2.wasm file - it's loaded at runtime by argon2-browser
        // We'll copy it to public and handle it separately
        if (id.includes('argon2.wasm') || id === 'a') {
          return true;
        }
        return false;
      },
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.wasm')) {
            return 'assets/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['argon2-browser'],
  },
  assetsInclude: ['**/*.wasm'],
  server: {
    strictPort: true,
    port: 1420,
  },
})
