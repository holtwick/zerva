// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.

/* eslint-disable no-console */

import fs from 'node:fs'
import httpModule from 'node:http'
import httpsModule from 'node:https'
import type { AddressInfo } from 'node:net'
import process from 'node:process'
import { emit, on, register } from '@zerva/core'
import { compressionMiddleware } from './compression'
import corsDefault from 'cors'
import express from 'express'
import type { HelmetOptions } from 'helmet'
import helmetDefault from 'helmet'
import { LogLevelInfo, Logger, isLocalHost, isString, promisify, valueToBoolean } from 'zeed'
import type { Express, NextFunction, Request, Response, Server, zervaHttpGetHandler, zervaHttpHandlerModes, zervaHttpInterface, zervaHttpPaths } from './types'

export * from './types'

const name = 'http'
const log = Logger(`zerva:${name}`, LogLevelInfo) // todo let the coder decide

export function useHttp(config?: {
  host?: string
  port?: number
  sslCrt?: string
  sslKey?: string

  /** Print server details to console */
  showServerInfo?: boolean

  /** None of the following middlewares is installed, just plain express. Add your own at httpInit  */
  noExtras?: boolean

  /** https://github.com/expressjs/cors */
  cors?: boolean

  /** Security setting https://helmetjs.github.io/ */
  helmet?: boolean | HelmetOptions

  /** Compress content */
  compression?: boolean

  /** https://stackoverflow.com/a/46475726/140927 */
  trustProxy?: boolean

  /** https://expressjs.com/en/api.html#express */
  postLimit?: string

  /** application/json -> object */
  postJson?: boolean

  /** text/plain -> string  */
  postText?: boolean

  /** application/octet-stream -> Buffer and application/* except json and urlencoded */
  postBinary?: boolean

  /** application/x-www-form-urlencoded */
  postUrlEncoded?: boolean

  /** Open a browser */
  openBrowser?: boolean

}): zervaHttpInterface {
  register(name, [])

  const {
    sslKey,
    sslCrt,
    port = 8080,
    host, // = process.env.NODE_MODE === "development" ? undefined : "0.0.0.0",
    showServerInfo = true,
    noExtras = false,
    cors = true,
    helmet = true,
    compression = true,
    trustProxy = true,
    postLimit = '1gb',
    postJson = true,
    postText = true,
    postBinary = true,
    postUrlEncoded = true,
    openBrowser = false,
  } = config ?? {}

  log('config =', config)

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
      app.use(express.json({ limit: postLimit }))
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

  function smartRequestHandler(
    mode: zervaHttpHandlerModes,
    path: zervaHttpPaths,
    handlers: zervaHttpGetHandler[],
  ): void {
    if (isString(path) && !path.startsWith('/'))
      path = `/${path}`

    log(`register ${mode.toUpperCase()} ${path}`)

    let suffix: string | undefined
    if (isString(path))
      suffix = /\.[a-z0-9]+$/.exec(path)?.[0]

    for (const handler of handlers) {
      app[mode](path, async (req: Request, res: Response, next: NextFunction) => {
        log(`${mode.toUpperCase()} ${path}`)
        log('headers =', req.headers)

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
          res.send(result)
        }
      })
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
}
