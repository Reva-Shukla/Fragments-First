import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy /api calls to the FastAPI backend during development.
      // cookieDomainRewrite: rewrites the domain on Set-Cookie headers so the
      // HttpOnly session cookie is treated as belonging to localhost and is
      // correctly sent back on subsequent requests from the Vite dev server.
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        cookieDomainRewrite: 'localhost',
      },
    },
  },
})

