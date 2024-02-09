/* eslint-disable node/prefer-global/process */
/// <reference types="vitest" />
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    // setupFiles: ['vitest-setup.ts'],
    include: ['**/*.{client,test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', '_archive', '*/_archive/*'],
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
