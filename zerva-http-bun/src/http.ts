import type { Server } from 'bun'
import type { LogConfig } from 'zeed'
import type { HttpBunInterface } from './types'
import { cors as corsPlugin } from '@elysiajs/cors'
import { serveStop, use } from '@zerva/core'
import { Elysia } from 'elysia'
import { z } from 'zeed'
import { setupSecurity } from './security'
import { setupWebSocket } from './websocket'

export * from './status'
export * from './types'
export * from './websocket'

const configSchema = z.object({
  log: z.any<LogConfig>().optional(),
  host: z.string().default('localhost').meta({ desc: 'Host to bind the server to' }),
  port: z.number().default(8080).meta({ desc: 'Port to listen on' }),
  sslCert: z.string().optional().meta({ desc: 'Path to SSL certificate' }),
  sslKey: z.string().optional().meta({ desc: 'Path to SSL key' }),
  showServerInfo: z.union([z.boolean(), z.enum(['minimal', 'full'])]).default(true).meta({ desc: 'Print server details to console' }),

  // Security
  cors: z.boolean().default(true).meta({ desc: 'Enable CORS middleware' }),
  helmet: z.boolean().default(true).meta({ desc: 'Security headers (Helmet-style)' }),
  csp: z.union([
    z.boolean(),
    z.enum(['strict', 'moderate', 'permissive', 'disabled']),
    z.string(),
    z.record(z.union([z.string(), z.array(z.string()), z.boolean()])),
  ]).default(false).meta({ desc: 'Content Security Policy configuration' }),
  securityHeaders: z.boolean().default(false).meta({ desc: 'Enhanced security headers (HSTS, COEP, COOP, etc.)' }),
  rateLimit: z.union([
    z.boolean(),
    z.object({
      windowMs: z.number().optional(),
      max: z.number().optional(),
      duration: z.number().optional(),
    }),
  ]).default(false).meta({ desc: 'Rate limiting configuration' }),

  // Features
  compression: z.boolean().default(true).meta({ desc: 'Enable response compression' }),
  websocket: z.boolean().default(true).meta({ desc: 'Enable WebSocket support' }),
  trustProxy: z.boolean().default(true).meta({ desc: 'Trust proxy headers' }),

  // Other
  openBrowser: z.boolean().default(false).meta({ desc: 'Open browser on startup' }),
})

interface RateLimitStore {
  [key: string]: { count: number, resetTime: number }
}

export const useHttpBun = use({
  name: 'http-bun',
  configSchema,
  setup({ config, log, on, emit }): HttpBunInterface {
    const {
      host,
      port,
      sslCert,
      sslKey,
      showServerInfo,
      cors,
      helmet,
      csp,
      securityHeaders,
      rateLimit: rateLimitConfig,
      compression,
      websocket,
      trustProxy,
      openBrowser,
    } = config

    // Create Elysia app
    let app = new Elysia()

    // Check SSL configuration
    const isSSL = !!(sslCert && sslKey)

    // Setup CORS
    if (cors) {
      log('CORS enabled')
      app = app.use(corsPlugin())
    }

    // Setup security headers
    setupSecurity(app, { helmet, csp, securityHeaders, isSSL }, log)

    // Rate limiting
    if (rateLimitConfig) {
      const rateLimitStore: RateLimitStore = {}
      const windowMs = typeof rateLimitConfig === 'object' && rateLimitConfig.windowMs
        ? rateLimitConfig.windowMs
        : 15 * 60 * 1000 // 15 minutes
      const maxRequests = typeof rateLimitConfig === 'object' && rateLimitConfig.max
        ? rateLimitConfig.max
        : 100

      log(`Rate limiting enabled: ${maxRequests} requests per ${windowMs}ms`)

      app.onBeforeHandle(({ request, set }) => {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
          || request.headers.get('x-real-ip')
          || 'unknown'

        const now = Date.now()
        const clientData = rateLimitStore[ip]

        if (!clientData || now > clientData.resetTime) {
          rateLimitStore[ip] = {
            count: 1,
            resetTime: now + windowMs,
          }
          return
        }

        if (clientData.count >= maxRequests) {
          set.status = 429
          return {
            error: 'Too many requests, please try again later.',
          }
        }

        clientData.count++
      })

      // Cleanup old entries periodically
      setInterval(() => {
        const now = Date.now()
        for (const [ip, data] of Object.entries(rateLimitStore)) {
          if (now > data.resetTime) {
            delete rateLimitStore[ip]
          }
        }
      }, windowMs)
    }

    // Compression is handled by Bun automatically when using Bun.serve
    if (compression) {
      log('Compression enabled (handled by Bun)')
    }

    // Trust proxy
    if (trustProxy) {
      log('Trust proxy enabled')
      // Elysia/Bun handles this via request headers
    }

    // Setup WebSocket
    if (websocket) {
      setupWebSocket(app, { enabled: true }, log)
    }

    let server: Server | null = null
    const protocol = isSSL ? 'https' : 'http'
    const url = `${protocol}://${host}:${port}`

    // Setup server start
    on('serveStart', async () => {
      // Emit httpInit event for users to setup routes BEFORE starting server
      emit('httpInit', { app, log })

      try {
        if (isSSL) {
          log(`Using SSL certificates: ${sslCert}, ${sslKey}`)
        }
        else {
          log('Using no SSL')
        }

        // Start the server
        // In Elysia, listen() starts the server and returns the app
        const listenConfig: any = {
          hostname: host,
          port,
        }

        if (isSSL) {
          listenConfig.tls = {
            cert: await Bun.file(sslCert!).text(),
            key: await Bun.file(sslKey!).text(),
          }
        }

        app.listen(listenConfig)
        server = app.server as Server

        // Show server info
        if (showServerInfo) {
          const buildInfo = { runtime: `Bun ${Bun.version}` }

          if (showServerInfo === 'full') {
            log.info(`
┌─────────────────────────────────────────────────┐
│  🌱 Zerva HTTP (Bun + Elysia)                   │
├─────────────────────────────────────────────────┤
│  URL:      ${url.padEnd(36)} │
│  Runtime:  ${buildInfo.runtime.padEnd(36)} │
└─────────────────────────────────────────────────┘
            `.trim())
          }
          else {
            log.info(`🌱 Server listening on ${url} (${buildInfo.runtime})`)
          }
        }

        emit('httpRunning', { app, url, port, host, isSSL })

        // Open browser
        if (openBrowser) {
          log('Opening browser...')
          const { exec } = await import('node:child_process')
          exec(`open ${url}`)
        }
      }
      catch (err: any) {
        if (err.code === 'EADDRINUSE') {
          log.error(`Port ${port} is already in use`)
          await serveStop()
        }
        else {
          log.error('Failed to start server:', err)
          throw err
        }
      }
    })

    // Setup server stop
    on('serveStop', async () => {
      log('Stopping HTTP server...')
      emit('httpStop', { app })

      if (server) {
        server.stop()
        server = null
      }

      log('HTTP server stopped')
    })

    return {
      app,
      url,
      port,
      host,
      isSSL,
    }
  },
})
