import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    host: '127.0.0.1', 
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        search: resolve(__dirname, 'search/index.html'),
        about: resolve(__dirname, 'about/index.html'),
        account: resolve(__dirname, 'account/index.html'),
      },
    },
  },
})

