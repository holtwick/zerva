import vue from '@vitejs/plugin-vue'
import type { UserConfig } from 'vite'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  build: {
    outDir: './dist_www',
    sourcemap: true,
  },
}) as UserConfig
