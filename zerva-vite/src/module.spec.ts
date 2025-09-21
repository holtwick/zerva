import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { on, serve, serveStop, setContext } from '@zerva/core'
import { useHttp } from '@zerva/http'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { useVite } from './module'

// Mock ZERVA_DEVELOPMENT global
const originalEnv = process.env
const originalZervaDevelopment = globalThis.ZERVA_DEVELOPMENT

describe('useVite', () => {
  let testDir: string
  let wwwDir: string
  let rootDir: string

  beforeAll(() => {
    // Setup test directories
    testDir = join(tmpdir(), `zerva-vite-test-${Date.now()}`)
    wwwDir = join(testDir, 'dist_www')
    rootDir = join(testDir, 'src')

    mkdirSync(testDir, { recursive: true })
    mkdirSync(wwwDir, { recursive: true })
    mkdirSync(rootDir, { recursive: true })

    // Create test HTML file
    writeFileSync(join(wwwDir, 'index.html'), '<html><body>Test</body></html>')

    // Create test asset
    mkdirSync(join(wwwDir, 'assets'), { recursive: true })
    writeFileSync(join(wwwDir, 'assets', 'test.png'), 'fake-png-content')

    // Create multi-page structure
    mkdirSync(join(wwwDir, 'app1'), { recursive: true })
    mkdirSync(join(wwwDir, 'app2'), { recursive: true })
    writeFileSync(join(wwwDir, 'app1', 'index.html'), '<html><body>App1</body></html>')
    writeFileSync(join(wwwDir, 'app2', 'index.html'), '<html><body>App2</body></html>')
  })

  beforeEach(() => {
    setContext()
    vi.clearAllMocks()
  })

  afterEach(async () => {
    try {
      await serveStop()
    }
    catch {
      // Ignore cleanup errors
    }
  })

  afterAll(() => {
    // Cleanup test directories
    rmSync(testDir, { recursive: true, force: true })
  })

  describe('configuration', () => {
    it('should be a function', () => {
      // Test that the module can be imported and is a function
      expect(typeof useVite).toBe('function')
    })

    it('should return module info when called with configuration', () => {
      // Mock HTTP being available
      useHttp({ port: 0 })

      const result = useVite({
        root: rootDir,
        www: wwwDir,
        mode: 'development',
        cacheAssets: false,
      })

      expect(result).toEqual({
        name: 'vite',
        config: {
          root: rootDir,
          www: wwwDir,
          mode: 'development',
          cacheAssets: false,
          cacheExtensions: 'png,ico,svg,jpg,pdf,jpeg,mp4,mp3,woff2,ttf,tflite',
          log: undefined,
        },
        paths: expect.objectContaining({
          root: expect.any(String),
          www: expect.any(String),
        }),
      })
    })

    it('should use default configuration when none provided', () => {
      useHttp({ port: 0 })

      const result = useVite()

      expect(result.name).toBe('vite')
      expect(result.config).toMatchObject({
        www: './dist_www',
        mode: 'development',
        cacheAssets: true,
      })
      expect(result.config.root).toContain('zerva-vite') // Should contain the package directory
    })
  })

  describe('production Mode Integration', () => {
    beforeEach(() => {
      // Mock production environment
      globalThis.ZERVA_DEVELOPMENT = false
      process.env.ZERVA_DEVELOPMENT = 'false'
    })

    afterEach(() => {
      globalThis.ZERVA_DEVELOPMENT = originalZervaDevelopment
      process.env = originalEnv
    })

    it('should setup static file serving in production mode', async () => {
      const port = 9001
      const httpEvents: any[] = []

      useHttp({ port })
      const viteResult = useVite({ www: wwwDir })

      expect(viteResult.name).toBe('vite')

      on('httpWillStart', (info) => {
        httpEvents.push(info)
      })

      await serve()

      expect(httpEvents).toHaveLength(1)

      // Basic test - server should start without errors
      const response = await fetch(`http://localhost:${port}/`)
      expect(response.status).toBe(200)
      const html = await response.text()
      expect(html).toContain('<html><body>Test</body></html>')
    })

    it('should handle cache configuration', () => {
      useHttp({ port: 0 })
      const viteResult = useVite({
        www: wwwDir,
        cacheAssets: true,
      })

      expect(viteResult.config.cacheAssets).toBe(true)
      // Full integration test would require a running server,
      // but we can verify the configuration is set correctly
    })
  })

  describe('development Mode', () => {
    beforeEach(() => {
      // Mock development environment
      globalThis.ZERVA_DEVELOPMENT = true
      process.env.ZERVA_DEVELOPMENT = 'true'
    })

    afterEach(() => {
      globalThis.ZERVA_DEVELOPMENT = originalZervaDevelopment
      process.env = originalEnv
    })

    it('should handle development mode configuration', () => {
      useHttp({ port: 0 })

      const result = useVite({ root: rootDir })
      expect(result.name).toBe('vite')
      expect(result.paths.root).toContain(rootDir)
    })
  })

  describe('module Requirements', () => {
    it('should declare http module as requirement', async () => {
      // Test that trying to use vite without http throws appropriate error
      try {
        useVite()
        expect(false).toBe(true) // Should not reach here
      }
      catch (error) {
        expect((error as Error).message).toContain('requires modules: http')
      }
    })

    it('should work when http module is available', () => {
      useHttp({ port: 0 })

      const result = useVite()
      expect(result.name).toBe('vite')
    })
  })

  describe('path Handling', () => {
    it('should handle custom root path', () => {
      useHttp({ port: 0 })

      const result = useVite({ root: '/custom/path' })
      expect(result.config.root).toBe('/custom/path')
    })

    it('should handle custom www path', () => {
      useHttp({ port: 0 })

      const result = useVite({ www: '/custom/www' })
      expect(result.config.www).toBe('/custom/www')
    })
  })
})
