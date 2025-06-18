import { defineConfig } from 'vite'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5173,
    host: true
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/index.html'),
        createRoom: resolve(__dirname, 'create-room.html'),
        room: resolve(__dirname, 'room.html'),
        profile: resolve(__dirname, 'profile.html')
      }
    }
  }
})