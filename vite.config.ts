import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://yunwu.ai',
        changeOrigin: true,
      },
      '/v1': {
        target: 'https://yunwu.ai',
        changeOrigin: true,
      }
    }
  }
})
