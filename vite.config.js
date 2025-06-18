import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        'create-room': 'create-room.html',
        'room': 'room.html',
        'profile': 'profile.html'
      }
    },
    assetsDir: 'assets'
  },
  server: {
    port: 5173,
    host: true
  }
})