// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.

import { emit, on, register } from "@zerva/core"
import cors from "cors"
import type { Express, Request, Response } from "express"
import express from "express"
import fs from "fs"
import helmet from "helmet"
import type { Server } from "http"
import httpModule from "http"
import httpsModule from "https"
import { AddressInfo } from "net"
import { isLocalHost, Logger, LogLevel, promisify } from "zeed"

const name = "http"
const log = Logger(`zerva:${name}`, LogLevel.info)

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
  showServerInfo?: boolean
}

export function useHttp(config?: httpConfig): httpInterface {
  register(name, [])

  const {
    sslKey,
    sslCrt,
    port = 8080,
    host, // = process.env.NODE_MODE === "development" ? undefined : "0.0.0.0",
    showServerInfo = true,
  } = config ?? {}

  // The actual web server
  const app = express()
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  )
  app.use(cors())

  // https://expressjs.com/en/api.html#express
  const limit = "1gb"
  app.use(express.json({ limit })) // application/json -> object
  app.use(express.text({ limit })) // text/plain -> string
  app.use(express.urlencoded({ limit, extended: true })) // application/x-www-form-urlencoded

  app.use(
    express.raw({
      limit,
      type: (req) => {
        let type = req.headers["content-type"]?.toLowerCase()
        return (
          type?.startsWith("application/") &&
          ![
            "application/octet-stream",
            "application/json",
            "application/x-www-form-urlencoded",
          ].includes(type)
        )
      },
    })
  ) // application/octet-stream -> Buffer and application/*

  const isSSL = sslKey && sslCrt
  let server: Server

  if (isSSL) {
    if (!fs.existsSync(sslKey) || !fs.existsSync(sslCrt)) {
      log.error("SSL files are not found. check your config.js file")
      process.exit(0)
    }
    log("using ssl certs", { sslCrt, sslKey })
    const tls = {
      cert: fs.readFileSync(sslCrt),
      key: fs.readFileSync(sslKey),
    }
    server = httpsModule.createServer(tls, app)
  } else {
    log("using no ssl")
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

      let suffix = /\.[a-z0-9]+$/.exec(path)?.[0]
      if (suffix) {
        res.type(suffix ?? "application/octet-stream")
      }

      let result: any = handler
      if (typeof handler === "function") {
        result = await promisify(handler({ res, req }))
      }

      if (result != null) {
        if (typeof result === "number") {
          res.sendStatus(result) // error code
        } else {
          if (typeof result === "string") {
            if (!suffix) {
              if (result.startsWith("<")) {
                res.set("Content-Type", "text/html; charset=utf-8")
              } else {
                res.set("Content-Type", "text/plain; charset=utf-8")
              }
            }
          }
          res.send(result) // html
        }
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
      // log.info(
      //   `Server on ${isSSL ? "https" : "http"}://${host}:${port} (${family})`
      // )
      if (showServerInfo) {
        console.info(
          `Zerva: Open page at ${isSSL ? "https" : "http"}://${host}:${port}`
        )
      }
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
