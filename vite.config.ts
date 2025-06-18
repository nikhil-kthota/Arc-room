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
        main: resolve(__dirname, 'index.html'),
        createRoom: resolve(__dirname, 'create-room.html'),
        room: resolve(__dirname, 'room.html'),
        profile: resolve(__dirname, 'profile.html'),
        // Include vanilla JS files
        app: resolve(__dirname, 'app.js'),
        createRoomJs: resolve(__dirname, 'create-room.js'),
        roomJs: resolve(__dirname, 'room.js'),
        profileJs: resolve(__dirname, 'profile.js'),
        // Include CSS files
        styles: resolve(__dirname, 'styles.css'),
        scrollbar: resolve(__dirname, 'scrollbar.css'),
        roomLayout: resolve(__dirname, 'room-layout.css')
      },
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `[name][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: (chunkInfo) => {
          // Keep vanilla JS files with their original names
          if (['app', 'createRoomJs', 'roomJs', 'profileJs'].includes(chunkInfo.name)) {
            return `[name].js`.replace('createRoomJs', 'create-room').replace('roomJs', 'room').replace('profileJs', 'profile');
          }
          return `assets/js/[name]-[hash].js`;
        }
      }
    }
  },
  publicDir: 'public'
})