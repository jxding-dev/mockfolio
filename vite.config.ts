import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves under /mockfolio/, Vercel serves at the domain root.
// Vercel sets process.env.VERCEL during the build, so pick the base accordingly.
const base = process.env.VERCEL ? '/' : '/mockfolio/'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base,
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    strictPort: false,
  },
})
