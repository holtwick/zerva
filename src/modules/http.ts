// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.

import cors from "cors"
import type { Express, Request, Response } from "express"
import express from "express"
import fs from "fs"
import helmet from "helmet"
import type { Server } from "http"
import httpModule from "http"
import httpsModule from "https"
import { AddressInfo } from "net"
import { isLocalHost, Logger, promisify } from "zeed"
import { emit, on, register } from "../context"

const name = "http"
const log = Logger(`zerva:${name}`)

export type { Response, Request, Express }

export type httpHandlerModes = "get" | "post" | "put" | "delete"

export type httpResultPrimaryTypes = string | number | undefined | null | object
export type httpGetHandler =
  | httpResultPrimaryTypes
  | ((info: {
      res: Response
      req: Request
    }) => Promise<httpResultPrimaryTypes> | httpResultPrimaryTypes)

export type httpInterface = {
  app: Express
  http: Server
  get: (path: string, handler: httpGetHandler) => void
  post: (path: string, handler: httpGetHandler) => void
  put: (path: string, handler: httpGetHandler) => void
  delete: (path: string, handler: httpGetHandler) => void
  /** @deprecated */
  addStatic: (path: string, fsPath: string) => void
  static: (path: string, fsPath: string) => void
}

declare global {
  interface ZContextEvents {
    httpInit(info: httpInterface): void
    httpWillStart(info: httpInterface): void
    httpRunning(info: {
      http: Server
      port: number
      family: string
      address: string
    }): void
    httpStop(): void
  }
}

export interface httpConfig {
  host?: string
  port?: number
  sslCrt?: string
  sslKey?: string
}

export function useHttp(config: httpConfig): httpInterface {
  register(name, [])

  const { sslKey, sslCrt, port = 4444, host } = config

  process.on("uncaughtException", (err) =>
    log.error("node js process error", err)
  )

  // Safety net, probably better suited in `register`?
  let checkServeTimeout = setTimeout(() => {
    console.info(
      "\n\n*** Did you probably forget to call serve() from Zerva to get it all started? ***\n\n"
    )
  }, 5000)

  on("serveInit", () => {
    clearTimeout(checkServeTimeout)
  })

  // The actual web server
  const app = express()
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  )
  app.use(cors())
  app.use(express.raw({ limit: "1gb" }))
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  const isSSL = sslKey && sslCrt
  let server: Server

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

  server.on("clientError", (err: Error) => {
    log.error("client request error, err")
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
    app[mode](path, async (req: Request, res: Response) => {
      log(`get ${path}`)
      if (typeof handler === "function") {
        let result = await promisify(handler({ res, req }))

        // `undefined` did handle themselves
        if (result == null) return

        if (typeof result === "number") {
          res.sendStatus(result) // error code
        } else if (typeof result === "string") {
          if (result.startsWith("<")) {
            res.set("Content-Type", "text/html; charset=utf-8")
            res.send(result) // html
          } else {
            res.set("Content-Type", "text/plain; charset=utf-8")
            res.send(result)
          }
        } else {
          // res.set("Content-Type", "application/json; charset=utf-8")
          res.send(result) // json etc.
        }
      } else {
        res.send(handler)
      }
    })
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

  function put(path: string, handler: httpGetHandler) {
    return smartRequestHandler("put", path, handler)
  }

  function del(path: string, handler: httpGetHandler) {
    return smartRequestHandler("delete", path, handler)
  }

  on("serveInit", async () => {
    log("serveInit")
    await emit("httpInit", {
      app,
      http: server,
      get,
      post,
      put,
      delete: del,
      addStatic,
      static: addStatic,
    })
  })

  on("serveStop", async () => {
    await emit("httpStop")
    return new Promise((resolve) => server.close(resolve as any))
  })

  on("serveStart", async () => {
    log("serveStart")
    await emit("httpWillStart", {
      app,
      http: server,
      get,
      post,
      put,
      delete: del,
      addStatic,
      static: addStatic,
    })
    server.listen({ host, port }, () => {
      const { port, family, address } = server.address() as AddressInfo
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
    put,
    delete: del,
    addStatic,
    static: addStatic,
  }
}
