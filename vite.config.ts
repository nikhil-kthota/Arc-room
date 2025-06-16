import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5173,
    host: true
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  }
})