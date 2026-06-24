import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/bitget': {
        target: 'https://api.bitget.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/bitget/, '')
      },
      '/api/kiyotaka': {
        target: 'https://api.kiyotaka.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/kiyotaka/, '')
      }
    }
  }
})
