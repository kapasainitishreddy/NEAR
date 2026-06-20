import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)))

// Local-first SPA. No backend, no proxy, no env required.
export default defineConfig({
  // Relative base so assets resolve under Capacitor's native scheme
  // (capacitor://localhost on iOS, http://localhost on Android) and on the web.
  base: './',
  plugins: [react()],
  // Surface the app version to the UI without bundling all of package.json.
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  server: {
    host: true,
    port: 5173,
  },
  build: {
    // Inline anything tiny; keep the icon/font assets as separate cached files.
    assetsInlineLimit: 2048,
    chunkSizeWarningLimit: 700,
  },
})
