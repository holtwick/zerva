/* eslint-disable no-console */

import type { HelmetOptions } from 'helmet'
import type { AddressInfo } from 'node:net'
import type { LogConfig } from 'zeed'
import type { Express, NextFunction, Request, Response, Server, zervaHttpGetHandler, zervaHttpHandlerModes, zervaHttpInterface, zervaHttpPaths, ZervaHttpRouteDescription } from './types'
import fs from 'node:fs'
import httpModule from 'node:http'
import httpsModule from 'node:https'
import process from 'node:process'
import { use } from '@zerva/core'
import corsDefault from 'cors'
import express from 'express'
import helmetDefault from 'helmet'
import { isLocalHost, isString, promisify, valueToBoolean, z } from 'zeed'
import { compressionMiddleware } from './compression'

export * from './status'
export * from './types'

const configSchema = z.object({
  log: z.any<LogConfig>().optional(),
  host: z.string().optional().props({ desc: 'Host to bind the server to' }),
  port: z.number().default(8080).props({ desc: 'Port to listen on' }),
  sslCrt: z.string().optional().props({ desc: 'Path to SSL certificate' }),
  sslKey: z.string().optional().props({ desc: 'Path to SSL key' }),
  showServerInfo: z.boolean().default(true).props({ desc: 'Print server details to console' }),
  noExtras: z.boolean().default(false).props({ desc: 'None of the following middlewares is installed, just plain express. Add your own at httpInit' }),
  cors: z.boolean().default(true).props({ desc: 'Enable CORS middleware https://github.com/expressjs/cors' }),
  helmet: z.union([z.boolean(), z.any<HelmetOptions>()]).default(true).props({ desc: 'Security setting https://helmetjs.github.io/' }),
  compression: z.boolean().default(true).props({ desc: 'Compress content' }),
  trustProxy: z.boolean().default(true).props({ desc: 'Trust proxy setting https://stackoverflow.com/a/46475726/140927' }),
  postLimit: z.string().default('1gb').props({ desc: 'Express post body size limit https://expressjs.com/en/api.html#express' }),
  postJson: z.boolean().default(true).props({ desc: 'application/json -> object' }),
  postText: z.boolean().default(true).props({ desc: 'text/plain -> string' }),
  postBinary: z.boolean().default(true).props({ desc: 'application/octet-stream -> Buffer and application/* except json and urlencoded' }),
  postUrlEncoded: z.boolean().default(true).props({ desc: 'application/x-www-form-urlencoded' }),
  openBrowser: z.boolean().default(false).props({ desc: 'Open a browser' }),
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

    if (noExtras === true) {
      log('noExtra')
    }
    else {
      if (helmet) {
        const options = helmet === true ? { contentSecurityPolicy: false } : helmet
        log('Helmet', options)
        app.use(helmetDefault(options))
      }

      if (compression)
        app.use(compressionMiddleware())

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
        app.use(
          express.raw({
            limit: postLimit,
            type: (req: any) => {
              const type = req.headers['content-type']?.toLowerCase()
              return (
                type?.startsWith('application/')
                && ![
                  'application/json',
                  'application/x-www-form-urlencoded',
                ].includes(type)
              )
            },
          }),
        )
      }
    }

    const isSSL = sslKey && sslCrt
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

    server.on('error', (err: Error) => {
      log.error('starting web server failed:', err.message)
    })

    server.on('clientError', (err: Error) => {
      log.error('client request error', err)
    })

    const routes: ZervaHttpRouteDescription[] = []

    function smartRequestHandler(
      mode: zervaHttpHandlerModes,
      path: zervaHttpPaths,
      handlers: zervaHttpGetHandler[],
    ) {
      if (isString(path) && !path.startsWith('/'))
        path = `/${path}`

      const route: ZervaHttpRouteDescription = { path: String(path), method: mode, description: '' }
      routes.push(route)

      log(`register ${mode.toUpperCase()} ${path}`)

      let suffix: string | undefined
      if (isString(path))
        suffix = /\.[a-z0-9]+$/.exec(path)?.[0]

      for (const handler of handlers) {
        app[mode](path, async (req: Request, res: Response, next: NextFunction) => {
          try {
            log(`${mode.toUpperCase()} ${path} ${path !== req.url ? `-> ${req.url}` : ''}`)
            // log('headers =', req.headers)

            // todo maybe later?
            if (suffix)
              res.type(suffix ?? 'application/octet-stream')

            let result: any = handler
            if (typeof handler === 'function') {
              const reqX = req as any
              reqX.req = req
              result = await promisify(handler(reqX, res, next))
            }

            if (result != null) {
              try {
                // [500, 'my error message'] or [404, {error: 'not found'}]
                if (Array.isArray(result) && result.length === 2 && typeof result[0] === 'number') {
                  res.status(result[0])
                  result = result[1]
                }

                if (typeof result === 'number') {
                  res.status(result).send(String(result)) // error code
                  return
                }

                if (typeof result === 'string') {
                  if (!suffix) {
                    if (result.startsWith('<'))
                      res.set('Content-Type', 'text/html; charset=utf-8')
                    else
                      res.set('Content-Type', 'text/plain; charset=utf-8')
                  }
                }
              }
              catch (err) {
                log.warn(`Problems setting status or header automatically for ${path}`, err)
              }
              res.send(result)
            }
          }
          catch (err) {
            log.warn(`Problems handling request for ${path}`, err)
          }
        })
      }

      return {
        description(description: string) {
          route.description = description
        },
      }
    }

    function addStatic(path: zervaHttpPaths, fsPath: string): void {
      log(`add static ${path} => ${fsPath}`)
      app.use(path, express.static(fsPath))
    }

    function GET(path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]) {
      return smartRequestHandler('get', path, handlers)
    }

    function POST(path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]) {
      return smartRequestHandler('post', path, handlers)
    }

    function PUT(path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]) {
      return smartRequestHandler('put', path, handlers)
    }

    function DELETE(path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]) {
      return smartRequestHandler('delete', path, handlers)
    }

    on('serveInit', async () => {
      log('serveInit')
      await emit('httpInit', {
        app,
        http: server,
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
        addStatic,
        static: addStatic,
        STATIC: addStatic,
        routes,
      } as any)
    })

    on('serveStop', async () => {
      await emit('httpStop')
      await new Promise(resolve => server.close(resolve as any))
      await emit('httpDidStop')
    })

    on('serveStart', async () => {
      log('serveStart')
      await emit('httpWillStart', {
        app,
        http: server,
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
        addStatic,
        static: addStatic,
        STATIC: addStatic,
        routes,
      } as any)
      server.listen({ host, port }, () => {
        const { port, family, address } = server.address() as AddressInfo
        const host = isLocalHost(address) ? 'localhost' : address
        const url = `${isSSL ? 'https' : 'http'}://${host}:${port}`
        if (showServerInfo) {
          console.info('\nZerva: *********************************************************')
          console.info(`Zerva: Open page at ${url}`)
          console.info('Zerva: *********************************************************\n')
        }

        void emit('httpRunning', { port, family, address, http: server })

        if (openBrowser || valueToBoolean(process.env.ZERVA_HTTP_OPEN, false)) {
          const start
            = process.platform === 'darwin'
              ? 'open -u'
              : process.platform === 'win32'
                ? 'start'
                : 'xdg-open'
          const cmd = `${start} ${url}`

          console.info(`Zerva: Open browser with: ${cmd}`)
          import('node:child_process').then(m => m.exec(cmd)).catch(err => log.error('Cannot start child process', err))
        }
      })
    })

    return {
      app,
      http: server,
      routes,
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
      addStatic,
      static: addStatic,
      STATIC: addStatic,
    }
  },
})
