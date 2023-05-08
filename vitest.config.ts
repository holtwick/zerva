/// <reference types="vitest" />
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    // setupFiles: ['vitest-setup.ts'],
    include: ['**/*.{client,test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', '*/_archive/*'],
    // snapshotFormat: {
    //   printBasicPrototype: true,
    // },
    // root: './src',
    globals: true,
    threads: false,
    // singleThread: true,
    // watch: true,
    // isolate: false,
    alias: {
      '@/': `${resolve(process.cwd(), 'src')}/`,
    },
  },
})
