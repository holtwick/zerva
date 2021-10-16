// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.

import cors from "cors"
import helmet from "helmet"
import { Logger, promisify, isLocalHost } from "zeed"
import { on, emit, register } from "../context"
import express from "express"
import fs from "fs"
import httpsModule from "https"
import httpModule from "http"
import type { Server } from "http"
import type { Response, Request, Express } from "express"

const name = "http"
const log = Logger(`zerva:${name}`)

export type httpGetHandler =
  | ((info: { res: Response; req: Request }) => Promise<any> | any)
  | any

export type httpHandlerModes = "get" | "post"

export type httpInterface = {
  app?: Express
  http: Server
  get: (path: string, handler: httpGetHandler) => void
  post: (path: string, handler: httpGetHandler) => void
  addStatic: (path: string, fsPath: string) => void
}

declare global {
  interface ZContextEvents {
    // setupHTTP(http: any, app: any): void
    httpInit(info: httpInterface): void
    httpRunning(info: {
      http: any
      port: number
      family: string
      address: string
    }): void
    httpStop(): void
  }
}

interface httpConfig {
  host?: string
  port?: number
  sslCrt?: string
  sslKey?: string
}

export function useHttp(config: httpConfig): httpInterface {
  register(name, [])

  const { sslKey, sslCrt, port = 4444, host } = config

  const app = express()
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  )
  app.use(cors())
  // app.options("*", cors())

  const isSSL = sslKey && sslCrt
  let server: any

  if (isSSL) {
    if (!fs.existsSync(sslKey) || !fs.existsSync(sslCrt)) {
      log.error("SSL files are not found. check your config.js file")
      process.exit(0)
    }
    log.info("using ssl certs", { sslCrt, sslKey })
    const tls = {
      cert: fs.readFileSync(sslCrt),
      key: fs.readFileSync(sslKey),
    }
    server = httpsModule.createServer(tls, app)
  } else {
    log.info("using no ssl")
    server = httpModule.createServer(app)
  }

  server.on("error", (err: Error) => {
    log.error("starting web server failed:", err.message)
  })

  function smartRequestHandler(
    mode: httpHandlerModes,
    path: string,
    handler: httpGetHandler
  ): void {
    if (!path.startsWith("/")) {
      path = `/${path}`
    }
    log(`register get ${path}`)
    app[mode](
      path,
      async (
        req: any, // express.Request
        res: any // express.Response
      ) => {
        log(`get ${path}`)
        if (typeof handler === "function") {
          let result = await promisify(handler({ res, req }))

          // `undefined` did handle themselves
          if (result == null) return

          if (typeof result === "number") {
            res.sendStatus(result) // error code
          } else if (typeof result === "string") {
            if (result.startsWith("<")) {
              res.send(result) // html
            } else {
              res.set("Content-Type", "text/plain")
              res.send(result)
            }
          } else {
            res.send(result) // json etc.
          }
        } else {
          res.send(handler)
        }
      }
    )
  }

  function addStatic(path: string, fsPath: string): void {
    log(`add static ${path} => ${fsPath}`)
    app.use(path, express.static(fsPath))
  }

  function get(path: string, handler: httpGetHandler) {
    return smartRequestHandler("get", path, handler)
  }

  function post(path: string, handler: httpGetHandler) {
    return smartRequestHandler("post", path, handler)
  }

  on("serveInit", async () => {
    log("serveInit")
    // await emit("setupHTTP", server, app)
    await emit("httpInit", {
      app,
      http: server,
      get,
      post,
      addStatic,
    })
  })

  on("serveStop", async () => {
    await emit("httpStop")
    return new Promise((resolve) => server.close(resolve))
  })

  on("serveStart", () => {
    log("serveStart")
    server.listen({ host, port }, () => {
      const { port, family, address } = server.address()
      const host = isLocalHost(address) ? "localhost" : address
      log.info(
        `listening on ${isSSL ? "https" : "http"}://${host}:${port} (${family})`
      )
      emit("httpRunning", { port, family, address, http: server })
    })
  })

  return {
    app,
    http: server,
    get,
    post,
    addStatic,
  }
}
