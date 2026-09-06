import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  /*
   * Two entries, not a router. `terms/index.html` is served at `/terms/` by the
   * dev server and built to the same path, so the document has a real URL on
   * any static host and stays out of the landing page's bundle.
   */
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        terms: fileURLToPath(new URL('./terms/index.html', import.meta.url)),
        privacy: fileURLToPath(new URL('./privacy/index.html', import.meta.url)),
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Honour an assigned PORT so the dev server can share a machine.
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
  },
})
