/* eslint-disable no-console */

import type { HelmetOptions } from 'helmet'
import type { AddressInfo } from 'node:net'
import type { LogConfig } from 'zeed'
import type { Express, Server, zervaHttpGetHandler, zervaHttpInterface, zervaHttpPaths, ZervaHttpRouteDescription } from './types'
import fs from 'node:fs'
import httpModule from 'node:http'
import httpsModule from 'node:https'
import process from 'node:process'
import { serveStop, use } from '@zerva/core'
import corsDefault from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import { isLocalHost, valueToBoolean, z } from 'zeed'
import { getZervaBuildInfo } from '../../zerva-core/src'
import { compressionMiddleware } from './compression'
import { smartRequestHandler } from './request'
import { setupSecurity } from './security'
import { formatStaticPath, isRequestProxied } from './utils'

export * from './status'
export * from './types'

const configSchema = z.object({
  log: z.any<LogConfig>().optional(),
  host: z.string().optional().meta({ desc: 'Host to bind the server to' }),
  port: z.number().default(8080).meta({ desc: 'Port to listen on' }),
  sslCrt: z.string().optional().meta({ desc: 'Path to SSL certificate' }),
  sslKey: z.string().optional().meta({ desc: 'Path to SSL key' }),
  showServerInfo: z.union([z.boolean(), z.enum(['minimal', 'full'])]).default(true).meta({ desc: 'Print server details to console: true/false or "minimal"/"full"' }),
  noExtras: z.boolean().default(false).meta({ desc: 'None of the following middlewares is installed, just plain express. Add your own at httpInit' }),
  cors: z.boolean().default(true).meta({ desc: 'Enable CORS middleware https://github.com/expressjs/cors' }),
  helmet: z.union([z.boolean(), z.any<HelmetOptions>()]).default(true).meta({ desc: 'Security setting https://helmetjs.github.io/' }),
  csp: z.union([
    z.boolean(),
    z.enum(['strict', 'moderate', 'permissive', 'disabled']),
    z.string(),
    z.record(z.union([z.string(), z.array(z.string()), z.boolean()])),
  ]).default(false).meta({ desc: 'Content Security Policy: boolean, preset (strict/moderate/permissive/disabled), string directive, or object' }),
  securityHeaders: z.boolean().default(false).meta({ desc: 'Enhanced security headers (HSTS, COEP, COOP, etc.)' }),
  rateLimit: z.union([
    z.boolean(),
    z.object({
      windowMs: z.number().optional(),
      max: z.number().optional(),
      skipSuccessfulRequests: z.boolean().optional(),
      skipFailedRequests: z.boolean().optional(),
      // skip: z.func().optional(),
    }),
  ]).default(false).meta({ desc: 'Rate limiting: boolean or configuration object with windowMs, max, etc.' }),
  compression: z.boolean().default(true).meta({ desc: 'Compress content' }),
  trustProxy: z.boolean().default(true).meta({ desc: 'Trust proxy setting https://stackoverflow.com/a/46475726/140927' }),
  postLimit: z.string().default('1gb').meta({ desc: 'Express post body size limit https://expressjs.com/en/api.html#express' }),
  postJson: z.boolean().default(true).meta({ desc: 'application/json -> object' }),
  postText: z.boolean().default(true).meta({ desc: 'text/plain -> string' }),
  postBinary: z.boolean().default(true).meta({ desc: 'application/octet-stream -> Buffer and application/* except json and urlencoded' }),
  postUrlEncoded: z.boolean().default(true).meta({ desc: 'application/x-www-form-urlencoded' }),
  openBrowser: z.boolean().default(false).meta({ desc: 'Open a browser' }),
})

export const useHttp = use({
  name: 'http',
  configSchema,
  setup({ config, log, on, emit }): zervaHttpInterface {
    const {
      sslKey,
      sslCrt,
      port,
      host,
      showServerInfo,
      noExtras,
      cors,
      helmet,
      csp,
      securityHeaders,
      rateLimit: rateLimitConfig,
      compression,
      trustProxy,
      postLimit,
      postJson,
      postText,
      postBinary,
      postUrlEncoded,
      openBrowser,
    } = config

    // The actual web server
    const app: Express = express()

    // Check if SSL is configured (needed for security setup)
    const isSSL = !!(sslKey && sslCrt)

    if (noExtras === true) {
      log('noExtra')
    }
    else {
      // Setup security headers (Helmet, CSP, enhanced security headers)
      setupSecurity(app, { helmet, csp, securityHeaders, isSSL }, log)

      // Rate limiting middleware
      if (rateLimitConfig) {
        const rateLimitOptions = rateLimitConfig === true
          ? {
              windowMs: 15 * 60 * 1000, // 15 minutes
              max: 100, // Limit each IP to 100 requests per windowMs
              message: { error: 'Too many requests, please try again later.' },
              standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
              legacyHeaders: false, // Disable the `X-RateLimit-*` headers
            }
          : rateLimitConfig

        log('Rate limiting enabled', rateLimitOptions)
        app.use(rateLimit(rateLimitOptions))
      }

      // Use compression unless request appears to be coming via a reverse proxy/CDN (X-Forwarded-*/Via)
      if (compression) {
        const staticCompressionMiddleware = compressionMiddleware()

        log('Compression enabled (auto-skip behind proxy)')
        app.use((req, res, next) => {
          if (isRequestProxied(req))
            return next()
          res.vary('Accept-Encoding')
          return staticCompressionMiddleware(req as any, res as any, next as any)
        })
      }

      if (cors) {
        log('CORS')
        app.use(corsDefault())
      }

      if (trustProxy) {
        log('Trust Proxy')
        app.enable('trust proxy')
      }

      if (postJson) {
        log(`Post JSON, limit=${postLimit}`)
        app.use(express.json({
          limit: postLimit,
          verify: (req, res, buf) => {
            if (req)
              (req as any).rawBody = buf
          },
        }))
      }

      if (postText) {
        log(`Post Text, limit=${postLimit}`)
        app.use(express.text({ limit: postLimit }))
      }

      if (postUrlEncoded) {
        log(`Post UrlEncoded, limit=${postLimit}`)
        app.use(express.urlencoded({ limit: postLimit, extended: true }))
      }

      if (postBinary) {
        log(`Post Uint8Binary, limit=${postLimit}`)
        const binaryTypes = new Set([
          'application/json',
          'application/x-www-form-urlencoded',
        ])

        app.use(
          express.raw({
            limit: postLimit,
            type: (req: any) => {
              const type = req.headers['content-type']?.toLowerCase()
              return type?.startsWith('application/') && !binaryTypes.has(type)
            },
          }),
        )
      }
    }

    let server: Server

    if (isSSL) {
      if (!fs.existsSync(sslKey) || !fs.existsSync(sslCrt)) {
        log.error('SSL files are not found. check your config.js file')
        process.exit(0)
      }
      log('using ssl certs', { sslCrt, sslKey })
      const tls = {
        cert: fs.readFileSync(sslCrt),
        key: fs.readFileSync(sslKey),
      }
      server = httpsModule.createServer(tls, app)
    }
    else {
      log('using no ssl')
      server = httpModule.createServer(app)
    }

    server.on('error', async (err: Error & { code?: string, port?: number }) => {
      if (err.code === 'EADDRINUSE') {
        log.error(`Port ${port} is already in use. Please check if another application is running on this port or choose a different port.`)
        log.error(`Try: lsof -ti:${port} | xargs kill -9  # to kill process using the port`)
        log.error(`Or set a different port in your configuration: { port: ${port + 1} }`)
      }
      else if (err.code === 'EACCES') {
        log.error(`Permission denied to bind to port ${port}. ${port < 1024 ? 'Ports below 1024 require root/admin privileges.' : ''}`)
      }
      else if (err.code === 'EADDRNOTAVAIL') {
        log.error(`Cannot bind to address ${host}:${port}. Address not available.`)
      }
      else {
        log.error('starting web server failed:', err.message)
      }

      // Use Zerva's graceful shutdown with exit code 1 for errors
      log.info('Initiating graceful shutdown due to server error...')
      try {
        await serveStop(1)
      }
      catch (stopError: any) {
        log.error('Error during graceful shutdown:', stopError)
        // If serveStop throws (which it now does), exit with the error code
        process.exit(stopError.exitCode || 1)
      }
    })

    server.on('clientError', (err: Error) => {
      log.error('client request error', err)
      console.trace('clientError')
    })

    const routes: ZervaHttpRouteDescription[] = []

    function addStatic(path: zervaHttpPaths, fsPath: string): void {
      log(`add static ${path} => ${fsPath}`)
      app.use(path, express.static(fsPath))
      routes.push({ path: String(path), method: 'static', description: formatStaticPath(fsPath) })
    }

    function GET(path: zervaHttpPaths, handler: zervaHttpGetHandler) {
      return smartRequestHandler({ method: 'get', path, handler, app, routes, log })
    }

    function POST(path: zervaHttpPaths, handler: zervaHttpGetHandler) {
      return smartRequestHandler({ method: 'post', path, handler, app, routes, log })
    }

    function PUT(path: zervaHttpPaths, handler: zervaHttpGetHandler) {
      return smartRequestHandler({ method: 'put', path, handler, app, routes, log })
    }

    function DELETE(path: zervaHttpPaths, handler: zervaHttpGetHandler) {
      return smartRequestHandler({ method: 'delete', path, handler, app, routes, log })
    }

    // Consolidate HTTP API object
    const httpApi = {
      app,
      http: server,
      routes,

      // Static file serving
      addStatic,
      static: addStatic,
      STATIC: addStatic,

      // Request handlers
      get: GET,
      post: POST,
      put: PUT,
      delete: DELETE,
      GET,
      POST,
      PUT,
      DELETE,
      onGET: GET,
      onPOST: POST,
      onPUT: PUT,
      onDELETE: DELETE,
    }

    on('serveInit', async () => {
      log('serveInit')
      await emit('httpInit', httpApi as any)
    })

    on('serveStop', async () => {
      log('Stopping HTTP server...')
      await emit('httpStop')
      await new Promise<void>((resolve) => {
        server.close((err) => {
          if (err)
            log.error('Error closing HTTP server:', err)
          else
            log('HTTP server closed successfully')
          resolve()
        })
      })
      await emit('httpDidStop')
    })

    on('serveStart', async () => {
      log('serveStart')
      await emit('httpWillStart', httpApi as any)
      server.listen({ host, port }, () => {
        const { port, family, address } = server.address() as AddressInfo
        const host = isLocalHost(address) ? 'localhost' : address
        const url = `${isSSL ? 'https' : 'http'}://${host}:${port}`
        if (showServerInfo) {
          const zervaInfo = getZervaBuildInfo()
          const isNotBuilt = zervaInfo?.build === false
          const buildDetails = `@zerva/bin ${zervaInfo?.buildZervaVersion ?? ''} built at ${zervaInfo?.date ?? ''}`
          const mode = isNotBuilt ? '🚧 DEVELOPMENT' : `🚀 PRODUCTION ${buildDetails}`
          const protocol = isSSL ? '🔒 HTTPS' : '🔓 HTTP'
          const localUrl = `${isSSL ? 'https' : 'http'}://localhost:${port}`
          const showMinimal = showServerInfo === 'minimal'

          if (showMinimal) {
            // Minimal output - just the essentials
            console.info(`🌐 Zerva: ${localUrl} (${mode})`)
          }
          else {
            // Full output - detailed information
            const configItems: string[] = []
            if (noExtras) {
              configItems.push('🔧 Plain Express (no middlewares)')
            }
            else {
              if (cors)
                configItems.push('🌍 CORS')
              if (helmet)
                configItems.push('🛡️  Helmet')
              if (csp)
                configItems.push('📋 CSP')
              if (securityHeaders)
                configItems.push('🔐 Security Headers')
              if (rateLimitConfig)
                configItems.push('⏱️  Rate Limiting')
              if (compression)
                configItems.push('🗜️  Compression')
              if (trustProxy)
                configItems.push('🔄 Trust Proxy')

              // Body parsers
              const bodyParsers: string[] = []
              if (postJson)
                bodyParsers.push('JSON')
              if (postText)
                bodyParsers.push('Text')
              if (postUrlEncoded)
                bodyParsers.push('URL-encoded')
              if (postBinary)
                bodyParsers.push('Binary')
              if (bodyParsers.length > 0)
                configItems.push(`📦 Body: ${bodyParsers.join(', ')} (${postLimit})`)
            }

            console.info(`\n${'═'.repeat(80)}`)
            console.info('🌐 ZERVA SERVER RUNNING')
            console.info('═'.repeat(80))
            console.info(`📍 Local:    ${localUrl}`)
            if (!isLocalHost(address)) {
              console.info(`🌍 Network:  ${url}`)
            }
            console.info(`⚙️  Mode:     ${mode}`)
            console.info(`🔐 Protocol: ${protocol}`)
            console.info(`🏠 Host:     ${address} (${family})`)
            console.info(`🚪 Port:     ${port}`)
            if (routes.length > 0) {
              console.info(`📋 Routes:   ${routes.length} endpoint${routes.length !== 1 ? 's' : ''} registered`)
              console.info('─'.repeat(80))
              const sortedRoutes = [...routes].sort((a, b) => {
                const pathCompare = String(a.path).localeCompare(String(b.path))
                return pathCompare !== 0 ? pathCompare : a.method.localeCompare(b.method)
              })

              // Determine column widths so all three columns align (left-aligned)
              const methodStrings = sortedRoutes.map(r => r.method.toUpperCase())
              const methodWidth = Math.max(...methodStrings.map(s => s.length), 0)
              const pathStrings = sortedRoutes.map(r => String(r.path))
              const pathWidth = Math.max(...pathStrings.map(s => s.length), 0)
              const descStrings = sortedRoutes.map(r => r.description ? String(r.description) : '')
              const descWidth = Math.max(...descStrings.map(s => s.length), 0)

              sortedRoutes.forEach((route, idx) => {
                const method = methodStrings[idx].padEnd(methodWidth)
                const pathStr = pathStrings[idx].padEnd(pathWidth)
                const desc = descStrings[idx] ? descStrings[idx].padEnd(descWidth) : ''
                // Two spaces between columns; omit description column if empty
                const descPart = descWidth > 0 ? `  ${desc}` : ''
                console.info(`   ${method}  ${pathStr}${descPart}`)
              })
            }
            if (configItems.length > 0) {
              console.info('─'.repeat(80))
              console.info('⚙️  Configuration:')
              configItems.forEach(item => console.info(`   ${item}`))
            }
            console.info(`${'═'.repeat(80)}\n`)
          }
        }

        void emit('httpRunning', { port, family, address, http: server })

        if (openBrowser || valueToBoolean(process.env.ZERVA_HTTP_OPEN, false)) {
          const start = process.platform === 'darwin'
            ? 'open -u'
            : process.platform === 'win32'
              ? 'start'
              : 'xdg-open'
          const cmd = `${start} ${url}`

          log.info(`Browser will be opened by calling: ${cmd}`)
          import('node:child_process')
            .then(m => m.exec(cmd))
            .catch(err => log.error('Cannot start child process', err))
        }
      })
    })

    return httpApi
  },
})
