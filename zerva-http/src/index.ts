// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.

import { emit, on, register } from "@zerva/core"
import e, { default as corsDefault } from "cors"
import express from "express"
import fs from "fs"
import { default as helmetDefault, HelmetOptions } from "helmet"
import httpModule from "http"
import httpsModule from "https"
import { AddressInfo } from "net"
import { isLocalHost, isString, Logger, LogLevel, promisify } from "zeed"
import {
  Express,
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
const log = Logger(`zerva:${name}`, LogLevel.info) // todo let the coder decide

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
}): httpInterface {
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
    trustProxy = true,
    postLimit = "1gb",
    postJson = true,
    postText = true,
    postBinary = true,
    postUrlEncoded = true,
  } = config ?? {}

  log("config =", config)

  // The actual web server
  const app: Express = express()

  if (noExtras === true) {
    log("noExtra")
  } else {
    if (helmet) {
      const options =
        helmet === true ? { contentSecurityPolicy: false } : helmet
      log("Helmet", options)
      app.use(helmetDefault(options))
    }

    if (cors) {
      log("CORS")
      app.use(corsDefault())
    }

    if (trustProxy) {
      log("Trust Proxy")
      app.enable("trust proxy")
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
          type: (req) => {
            let type = req.headers["content-type"]?.toLowerCase()
            return (
              type?.startsWith("application/") &&
              ![
                "application/json",
                "application/x-www-form-urlencoded",
              ].includes(type)
            )
          },
        })
      )
    }
  }

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
