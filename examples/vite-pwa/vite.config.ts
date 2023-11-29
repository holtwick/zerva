import vue from '@vitejs/plugin-vue'
import type { UserConfig } from 'vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      devOptions: {
        enabled: true,
        navigateFallback: 'index.html',
        type: 'module',
      },

      srcDir: 'src',
      filename: 'service-worker.ts',

      strategies: 'injectManifest',
      injectRegister: false,

      manifest: {
        name: 'pwa-demo',
      },

      // manifest: false,
      // injectManifest: {
      //   injectionPoint: null,
      // },
    }),
  ],
  build: {
    outDir: './dist_www',
    sourcemap: true,
  },
}) as UserConfig
