import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Local-first SPA. No backend, no proxy, no env required.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
})
