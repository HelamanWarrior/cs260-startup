import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    host: '127.0.0.1', 
    proxy: {
      '/api': 'http://127.0.0.1:3000',
    },
  },
})

