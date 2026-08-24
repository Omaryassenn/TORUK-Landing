import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // three.js is only needed by the splash screen and is far larger than
        // the rest of the app. Its own chunk downloads in parallel with the
        // app code and stays cached across deploys that do not touch it.
        advancedChunks: {
          groups: [{ name: 'three', test: /[\\/]node_modules[\\/]three[\\/]/ }],
        },
      },
    },
  },
  // Honour an assigned PORT so the dev server can share a machine.
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
  },
})
