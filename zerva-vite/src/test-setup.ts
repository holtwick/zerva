import process from 'node:process'
import { vi } from 'vitest'

// Mock global variables that are defined by the build system
globalThis.ZERVA_DEVELOPMENT = false
globalThis.ZERVA_PRODUCTION = true
globalThis.ZERVA_VERSION = '0.71.0'

// Set up default environment variables
process.env.ZERVA_DEVELOPMENT = 'false'
process.env.ZERVA_PRODUCTION = 'true'
process.env.ZERVA_VERSION = '0.71.0'

// Mock console methods to avoid noise in test output
const originalConsole = globalThis.console
globalThis.console = {
  ...originalConsole,
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  log: vi.fn(),
}

// Restore console for specific tests that need it
export function restoreConsole() {
  globalThis.console = originalConsole
}

export function mockConsole() {
  globalThis.console = {
    ...originalConsole,
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
  }
}
