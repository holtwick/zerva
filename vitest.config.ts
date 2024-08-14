/// <reference types="vitest" />
import { resolve } from 'node:path'
import process from 'node:process'
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    include: ['**/*.{client,test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', '_archive', '*/_archive/*'],
    globals: true,
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    alias: {
      '@/': `${resolve(process.cwd(), 'src')}/`,
    },
  },
})
