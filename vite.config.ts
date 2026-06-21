import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // This is equivalent to --host
    allowedHosts: [
      'suvietanhminh.site',
      'www.suvietanhminh.site',
      '.suvietanhminh.site', // Wildcard for all subdomains
      'localhost',
      '127.0.0.1',
      '10.128.0.6'
    ],
    proxy: {
      '/api': {
        target: process.env.API_BASE_URL ?? 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
    },
  },
})
