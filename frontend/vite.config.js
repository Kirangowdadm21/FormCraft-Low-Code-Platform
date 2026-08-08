import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const API_TARGET = 'http://127.0.0.1:8000'

// Routes that need HTML bypass (SPA handles them in browser)
function htmlBypass(req) {
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    return '/index.html'
  }
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/auth': { target: API_TARGET, changeOrigin: true },
      '/users': { target: API_TARGET, changeOrigin: true },
      '/forms': { target: API_TARGET, changeOrigin: true, bypass: htmlBypass },
      '/fields': { target: API_TARGET, changeOrigin: true, bypass: htmlBypass },
      '/rules': { target: API_TARGET, changeOrigin: true },
      '/submissions': { target: API_TARGET, changeOrigin: true },
      '/responses': { target: API_TARGET, changeOrigin: true },
      '/uploads': { target: API_TARGET, changeOrigin: true },
      '/analytics': { target: API_TARGET, changeOrigin: true },
      '/export': { target: API_TARGET, changeOrigin: true },
      '/templates': { target: API_TARGET, changeOrigin: true },
      '/qrcodes': { target: API_TARGET, changeOrigin: true },
      '/reports': { target: API_TARGET, changeOrigin: true },
      '/public': { target: API_TARGET, changeOrigin: true },
      '/health': { target: API_TARGET, changeOrigin: true },
      '/translate': { target: API_TARGET, changeOrigin: true },
    }
  }
})
