import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/Web/',
  build: {
    assetsDir: 'assets',
    assetsInlineLimit: 4096
  }
})
