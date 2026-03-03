import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://two.edu.kg',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: '../Personal Post Office/dist',
  }
})
