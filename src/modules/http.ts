// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.

import cors from "cors"
import helmet from "helmet"
import { Logger, promisify } from "zeed"
import { on, emit, register } from "../context.js"
import express from "express"
import fs from "fs"
import httpsModule from "https"
import httpModule from "http"

const name = "http"
const log = Logger(`zerva:${name}`)

export type httpGetHandler =
  | ((info: { res: unknown; req: unknown }) => Promise<any> | any)
  | any

declare global {
  interface ZContextEvents {
    setupHTTP(http: any, app: any): void
    httpInit(info: {
      http: any
      app?: any
      get: (path: string, handler: httpGetHandler) => void
      addStatic: (path: string, fsPath: string) => void
    }): void
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

export function useHttp(config: httpConfig): {
  app: express.Express
  get: (path: string, handler: httpGetHandler) => void
  addStatic?: (path: string, fsPath: string) => void
} {
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

  let server: any
  if (sslKey && sslCrt) {
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

  function get(path: string, handler: httpGetHandler): void {
    if (!path.startsWith("/")) {
      path = `/${path}`
    }
    log(`register get ${path}`)
    app.get(path, async (req: any, res: any) => {
      log(`get ${path}`)
      if (typeof handler === "function") {
        let result = await promisify(handler({ res, req }))
        if (result != null) {
          res.send(result)
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

  on("serveInit", async () => {
    log("serveInit")
    await emit("setupHTTP", server, app)
    await emit("httpInit", { app, http: server, get, addStatic })
  })

  on("serveStop", async () => {
    await emit("httpStop")
    return new Promise((resolve) => server.close(resolve))
  })

  on("serveStart", () => {
    log("serveStart")
    server.listen({ host, port }, () => {
      const { port, family, address } = server.address()
      log.info(`listening on ${address}:${port} (${family})`)
      emit("httpRunning", { port, family, address, http: server })
    })
  })

  return { app, get, addStatic }
}
