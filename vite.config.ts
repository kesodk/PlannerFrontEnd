/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  css: {
    postcss: './postcss.config.cjs',
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://cv-pc-x-server:1102',
        changeOrigin: true,
        secure: false, // Accepter self-signed certificates
        rewrite: (path) => path, // Behold /api i stien
      }
    }
  }
})
