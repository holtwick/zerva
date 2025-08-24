import { setContext } from '@zerva/core'
import { useHttp } from '@zerva/http'
import { beforeEach, describe, expect, it } from 'vitest'
import * as zervaVite from './index'
import { useVite } from './module'
import { zervaMultiPageAppIndexRouting } from './multi'

describe('zerva-vite module exports', () => {
  beforeEach(() => {
    setContext()
  })

  it('should export useVite function', () => {
    expect(zervaVite.useVite).toBeDefined()
    expect(typeof zervaVite.useVite).toBe('function')
    expect(zervaVite.useVite).toBe(useVite)
  })

  it('should export zervaMultiPageAppIndexRouting function', () => {
    expect(zervaVite.zervaMultiPageAppIndexRouting).toBeDefined()
    expect(typeof zervaVite.zervaMultiPageAppIndexRouting).toBe('function')
    expect(zervaVite.zervaMultiPageAppIndexRouting).toBe(zervaMultiPageAppIndexRouting)
  })

  it('should export all expected members', () => {
    const exports = Object.keys(zervaVite)

    // Should contain at least these exports
    expect(exports).toContain('useVite')
    expect(exports).toContain('zervaMultiPageAppIndexRouting')
  })

  it('should not have unexpected exports', () => {
    const exports = Object.keys(zervaVite)
    const expectedExports = ['useVite', 'zervaMultiPageAppIndexRouting']

    // All exports should be expected (allowing for potential future additions)
    for (const exportName of exports) {
      expect(
        expectedExports.includes(exportName)
        || exportName.startsWith('_'), // Allow internal exports starting with underscore
      ).toBe(true)
    }
  })

  describe('useVite function', () => {
    it('should be a function', () => {
      expect(typeof zervaVite.useVite).toBe('function')
    })

    it('should be callable with http module loaded', () => {
      useHttp({ port: 0 })

      expect(() => zervaVite.useVite()).not.toThrow()
    })

    it('should be callable with configuration object', () => {
      useHttp({ port: 0 })

      expect(() => zervaVite.useVite({
        root: '.',
        www: './dist_www',
        mode: 'development',
        cacheAssets: true,
      })).not.toThrow()
    })

    it('should return module info when called', () => {
      useHttp({ port: 0 })

      const result = zervaVite.useVite()
      expect(result.name).toBe('vite')
      expect(result.config).toMatchObject({
        www: './dist_www',
        mode: 'development',
        cacheAssets: true,
      })
      expect(result.config.root).toContain('zerva-vite') // Should contain the package directory
      expect(result.paths).toBeDefined()
      expect(result.paths.root).toBeDefined()
      expect(result.paths.www).toBeDefined()
    })
  })

  describe('zervaMultiPageAppIndexRouting function', () => {
    it('should return a vite plugin object', () => {
      const plugin = zervaVite.zervaMultiPageAppIndexRouting()

      expect(plugin).toBeDefined()
      expect(typeof plugin).toBe('object')
      expect(plugin.name).toBe('zerva-multi-page-routing')
      expect(typeof plugin.configureServer).toBe('function')
    })

    it('should be callable without arguments', () => {
      expect(() => zervaVite.zervaMultiPageAppIndexRouting()).not.toThrow()
    })
  })
})
