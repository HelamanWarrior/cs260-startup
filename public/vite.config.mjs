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
        main: resolve(import.meta.dirname, 'index.html'),
	home: resolve(import.meta.dirname, 'home/index.html'),
        search: resolve(import.meta.dirname, 'search/index.html'),
        about: resolve(import.meta.dirname, 'about/index.html'),
        account: resolve(import.meta.dirname, 'account/index.html'),
      },
    },
  },
})

