import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

function testPlugin() {
  return {
    name: 'test',
    configureServer(server: any) {
      return () => {
        server.middlewares.use(async (req: any, res: any, next: any) => {
          console.log(req.originalUrl)
          next()
        })
      }
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    //
    vue(),
    testPlugin(),
  ],
  build: {
    outDir: './dist_www',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        help: resolve(__dirname, 'help/index.html'),
      },
    },
  },
})
