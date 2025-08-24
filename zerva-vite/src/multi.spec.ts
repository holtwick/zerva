import { beforeEach, describe, expect, it, vi } from 'vitest'
import { zervaMultiPageAppIndexRouting } from './multi'

describe('zervaMultiPageAppIndexRouting', () => {
  let mockServer: any
  let mockReq: any
  let mockRes: any
  let mockNext: any

  beforeEach(() => {
    mockNext = vi.fn()
    mockReq = {
      originalUrl: '/',
      url: '/',
    }
    mockRes = {}

    mockServer = {
      config: {
        build: {
          rollupOptions: {
            input: {
              main: '/path/to/main.html',
              admin: '/path/to/admin.html',
              help: '/path/to/help.html',
            },
          },
        },
      },
      middlewares: {
        use: vi.fn(),
      },
    }
  })

  it('should create a vite plugin with correct name', () => {
    const plugin = zervaMultiPageAppIndexRouting()

    expect(plugin).toBeDefined()
    expect(plugin.name).toBe('zerva-multi-page-routing')
    expect(typeof plugin.configureServer).toBe('function')
  })

  it('should configure server middleware correctly', () => {
    const plugin = zervaMultiPageAppIndexRouting()
    const middlewareSetup = plugin.configureServer(mockServer)

    expect(typeof middlewareSetup).toBe('function')

    // Execute the middleware setup
    const middlewareHandler = middlewareSetup()
    expect(mockServer.middlewares.use).toHaveBeenCalledWith(expect.any(Function))
  })

  it('should route requests to correct app index.html', async () => {
    const plugin = zervaMultiPageAppIndexRouting()
    const middlewareSetup = plugin.configureServer(mockServer)
    const middlewareHandler = middlewareSetup()

    // Get the middleware function that was registered
    const middleware = mockServer.middlewares.use.mock.calls[0][0]

    // Test routing to main app
    mockReq.originalUrl = '/main/some/path'
    mockReq.url = '/main/some/path'

    await middleware(mockReq, mockRes, mockNext)

    expect(mockReq.url).toBe('/main/index.html')
    expect(mockNext).toHaveBeenCalled()
  })

  it('should route admin requests correctly', async () => {
    const plugin = zervaMultiPageAppIndexRouting()
    const middlewareSetup = plugin.configureServer(mockServer)
    const middlewareHandler = middlewareSetup()

    const middleware = mockServer.middlewares.use.mock.calls[0][0]

    mockReq.originalUrl = '/admin'
    mockReq.url = '/admin'

    await middleware(mockReq, mockRes, mockNext)

    expect(mockReq.url).toBe('/admin/index.html')
    expect(mockNext).toHaveBeenCalled()
  })

  it('should route help requests correctly', async () => {
    const plugin = zervaMultiPageAppIndexRouting()
    const middlewareSetup = plugin.configureServer(mockServer)
    const middlewareHandler = middlewareSetup()

    const middleware = mockServer.middlewares.use.mock.calls[0][0]

    mockReq.originalUrl = '/help/section/page'
    mockReq.url = '/help/section/page'

    await middleware(mockReq, mockRes, mockNext)

    expect(mockReq.url).toBe('/help/index.html')
    expect(mockNext).toHaveBeenCalled()
  })

  it('should not modify URL for unmatched routes', async () => {
    const plugin = zervaMultiPageAppIndexRouting()
    const middlewareSetup = plugin.configureServer(mockServer)
    const middlewareHandler = middlewareSetup()

    const middleware = mockServer.middlewares.use.mock.calls[0][0]

    mockReq.originalUrl = '/unknown/route'
    mockReq.url = '/unknown/route'
    const originalUrl = mockReq.url

    await middleware(mockReq, mockRes, mockNext)

    expect(mockReq.url).toBe(originalUrl)
    expect(mockNext).toHaveBeenCalled()
  })

  it('should handle missing rollupOptions gracefully', async () => {
    const plugin = zervaMultiPageAppIndexRouting()

    // Server without rollupOptions
    const serverWithoutOptions = {
      config: {
        build: {},
      },
      middlewares: {
        use: vi.fn(),
      },
    }

    const middlewareSetup = plugin.configureServer(serverWithoutOptions)
    const middlewareHandler = middlewareSetup()

    const middleware = serverWithoutOptions.middlewares.use.mock.calls[0][0]

    mockReq.originalUrl = '/test'
    mockReq.url = '/test'
    const originalUrl = mockReq.url

    await middleware(mockReq, mockRes, mockNext)

    // URL should remain unchanged
    expect(mockReq.url).toBe(originalUrl)
    expect(mockNext).toHaveBeenCalled()
  })

  it('should handle missing input configuration gracefully', async () => {
    const plugin = zervaMultiPageAppIndexRouting()

    // Server with rollupOptions but no input
    const serverWithoutInput = {
      config: {
        build: {
          rollupOptions: {},
        },
      },
      middlewares: {
        use: vi.fn(),
      },
    }

    const middlewareSetup = plugin.configureServer(serverWithoutInput)
    const middlewareHandler = middlewareSetup()

    const middleware = serverWithoutInput.middlewares.use.mock.calls[0][0]

    mockReq.originalUrl = '/test'
    mockReq.url = '/test'
    const originalUrl = mockReq.url

    await middleware(mockReq, mockRes, mockNext)

    // URL should remain unchanged
    expect(mockReq.url).toBe(originalUrl)
    expect(mockNext).toHaveBeenCalled()
  })

  it('should handle non-object input configuration gracefully', async () => {
    const plugin = zervaMultiPageAppIndexRouting()

    // Server with non-object input
    const serverWithStringInput = {
      config: {
        build: {
          rollupOptions: {
            input: 'single-entry.html',
          },
        },
      },
      middlewares: {
        use: vi.fn(),
      },
    }

    const middlewareSetup = plugin.configureServer(serverWithStringInput)
    const middlewareHandler = middlewareSetup()

    const middleware = serverWithStringInput.middlewares.use.mock.calls[0][0]

    mockReq.originalUrl = '/test'
    mockReq.url = '/test'
    const originalUrl = mockReq.url

    await middleware(mockReq, mockRes, mockNext)

    // URL should remain unchanged
    expect(mockReq.url).toBe(originalUrl)
    expect(mockNext).toHaveBeenCalled()
  })

  it('should handle errors gracefully and continue with original URL', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const plugin = zervaMultiPageAppIndexRouting()

    // Server that will cause an error when accessing config
    const faultyServer = {
      get config() {
        throw new Error('Config access error')
      },
      middlewares: {
        use: vi.fn(),
      },
    }

    const middlewareSetup = plugin.configureServer(faultyServer)
    const middlewareHandler = middlewareSetup()

    const middleware = faultyServer.middlewares.use.mock.calls[0][0]

    mockReq.originalUrl = '/test'
    mockReq.url = '/test'
    const originalUrl = mockReq.url

    await middleware(mockReq, mockRes, mockNext)

    // URL should remain unchanged
    expect(mockReq.url).toBe(originalUrl)
    expect(mockNext).toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith('Multi-page routing error:', expect.any(Error))

    consoleSpy.mockRestore()
  })

  it('should handle exact app name matches', async () => {
    const plugin = zervaMultiPageAppIndexRouting()
    const middlewareSetup = plugin.configureServer(mockServer)
    const middlewareHandler = middlewareSetup()

    const middleware = mockServer.middlewares.use.mock.calls[0][0]

    // Test exact match
    mockReq.originalUrl = '/main'
    mockReq.url = '/main'

    await middleware(mockReq, mockRes, mockNext)

    expect(mockReq.url).toBe('/main/index.html')
    expect(mockNext).toHaveBeenCalled()
  })

  it('should only match the first matching app name', async () => {
    // Create server config where one app name is prefix of another
    const serverWithOverlappingNames = {
      config: {
        build: {
          rollupOptions: {
            input: {
              app: '/path/to/app.html',
              application: '/path/to/application.html',
            },
          },
        },
      },
      middlewares: {
        use: vi.fn(),
      },
    }

    const plugin = zervaMultiPageAppIndexRouting()
    const middlewareSetup = plugin.configureServer(serverWithOverlappingNames)
    const middlewareHandler = middlewareSetup()

    const middleware = serverWithOverlappingNames.middlewares.use.mock.calls[0][0]

    mockReq.originalUrl = '/app/test'
    mockReq.url = '/app/test'

    await middleware(mockReq, mockRes, mockNext)

    // Should match 'app' first, not 'application'
    expect(mockReq.url).toBe('/app/index.html')
    expect(mockNext).toHaveBeenCalled()
  })
})
