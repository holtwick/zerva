/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 30000,
    // Setup global test environment
    setupFiles: ['./src/test-setup.ts'],
    // Allow tests to access global ZERVA_DEVELOPMENT
    define: {
      ZERVA_DEVELOPMENT: 'globalThis.ZERVA_DEVELOPMENT',
      ZERVA_PRODUCTION: 'globalThis.ZERVA_PRODUCTION',
    },
  } as any,
})
