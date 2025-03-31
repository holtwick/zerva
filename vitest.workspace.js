import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  "./vitest.config.ts",
  "./examples/vite-serviceworker/vite.config.ts",
  "./examples/vite-pwa/vite.config.ts",
  "./examples/rpc/vite.config.ts",
  "./examples/vite/vite.config.ts",
  "./examples/websocket/vite.config.ts"
])
