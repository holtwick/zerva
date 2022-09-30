// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.

import { emit, on, register } from "@zerva/core"
import cors from "cors"
import express from "express"
import fs from "fs"
import helmet from "helmet"
import httpModule from "http"
import httpsModule from "https"
import { AddressInfo } from "net"
import { isLocalHost, isString, Logger, LogLevel, promisify } from "zeed"
import {
  Express,
  httpConfig,
  httpGetHandler,
  httpHandlerModes,
  httpInterface,
  httpPaths,
  Request,
  Response,
  Server,
} from "./types"

export * from "./types"

const name = "http"
const log = Logger(`zerva:${name}`, LogLevel.info)

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
  const app: Express = express()

  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  )

  app.use(cors())

  // https://stackoverflow.com/a/46475726/140927
  app.enable("trust proxy")

  // https://expressjs.com/en/api.html#express
  const limit = "1gb"

  // application/json -> object
  app.use(express.json({ limit }))

  // text/plain -> string
  app.use(express.text({ limit }))

  // application/x-www-form-urlencoded
  app.use(express.urlencoded({ limit, extended: true }))

  // application/octet-stream -> Buffer and application/* except json and urlencoded
  app.use(
    express.raw({
      limit,
      type: (req) => {
        let type = req.headers["content-type"]?.toLowerCase()
        return (
          type?.startsWith("application/") &&
          !["application/json", "application/x-www-form-urlencoded"].includes(
            type
          )
        )
      },
    })
  )

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
    path: httpPaths,
    handler: httpGetHandler
  ): void {
    if (isString(path) && !path.startsWith("/")) {
      path = `/${path}`
    }
    log(`register ${mode.toUpperCase()} ${path}`)
    app[mode](path, async (req: Request, res: Response) => {
      log(`${mode.toUpperCase()} ${path}`)
      log(`headers =`, req.headers)

      let suffix
      if (isString(path)) {
        suffix = /\.[a-z0-9]+$/.exec(path)?.[0]
        if (suffix) {
          res.type(suffix ?? "application/octet-stream")
        }
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
          res.send(result)
        }
      }
    })
  }

  function addStatic(path: httpPaths, fsPath: string): void {
    log(`add static ${path} => ${fsPath}`)
    app.use(path, express.static(fsPath))
  }

  function get(path: httpPaths, handler: httpGetHandler) {
    return smartRequestHandler("get", path, handler)
  }

  function post(path: httpPaths, handler: httpGetHandler) {
    return smartRequestHandler("post", path, handler)
  }

  function put(path: httpPaths, handler: httpGetHandler) {
    return smartRequestHandler("put", path, handler)
  }

  function del(path: httpPaths, handler: httpGetHandler) {
    return smartRequestHandler("delete", path, handler)
  }

  on("serveInit", async () => {
    log("serveInit")

    await emit("httpInit", {
      // @ts-ignore
      app,
      http: server,
      get,
      post,
      put,
      delete: del,
      GET: get,
      POST: post,
      PUT: put,
      DELETE: del,
      addStatic,
      static: addStatic,
      STATIC: addStatic,
    })
  })

  on("serveStop", async () => {
    await emit("httpStop")
    return new Promise((resolve) => server.close(resolve as any))
  })

  on("serveStart", async () => {
    log("serveStart")
    await emit("httpWillStart", {
      // @ts-ignore
      app,
      http: server,
      get,
      post,
      put,
      delete: del,
      GET: get,
      POST: post,
      PUT: put,
      DELETE: del,
      addStatic,
      static: addStatic,
      STATIC: addStatic,
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
    GET: get,
    POST: post,
    PUT: put,
    DELETE: del,
    addStatic,
    static: addStatic,
    STATIC: addStatic,
  }
}
