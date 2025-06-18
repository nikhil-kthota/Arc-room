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
        main: 'index.html',
        createRoom: 'create-room.html',
        room: 'room.html',
        profile: 'profile.html'
      },
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    }
  },
  publicDir: 'public',
  assetsInclude: ['**/*.css', '**/*.js']
})