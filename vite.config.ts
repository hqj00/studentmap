import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  // 相对资源路径：GitHub Pages 项目页（/仓库名/ 子路径）也能正常加载
  base: './',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // AI 代理（server/ai-proxy.mjs，8787）
      '/api/ai': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
      // 班级自建服务器（server/class-server.mjs，8788）：/api/ping、/api/auth/*、/api/library
      '/api': {
        target: 'http://localhost:8788',
        changeOrigin: true,
      },
    },
  },
})
