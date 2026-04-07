import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/compose-docs/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('highlight.js') || id.includes('marked')) {
            return 'markdown-vendor'
          }
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
})
