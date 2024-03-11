/// <reference types="vitest" />
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import process from 'node:process'

export default defineConfig({
  test: {
    include: ['**/*.{client,test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', '_archive', '*/_archive/*'],
    globals: true,
    poolOptions: {
      threads:  {
        singleThread: true
      }
    },
    alias: {
      '@/': `${resolve(process.cwd(), 'src')}/`,
    },
  },
})
