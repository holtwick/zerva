// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.

import { Logger, on, register, toPath } from "@zerva/core"
import "@zerva/http"
import { existsSync } from "fs"
import { resolve } from "path"
import { createServer } from "vite"

const name = "vite"
const log = Logger(`zerva:${name}`)

interface Config {
  root?: string
  www?: string
}

export function useVite(config?: Config) {
  log.info(`use ${name} ${process.env.ZERVA}`)
  register(name, ["http"])

  const { root = process.cwd(), www = "./dist_www" } = config ?? {}
  const rootPath = toPath(root)
  const wwwPath = toPath(www)

  const isDevMode =
    process.env.ZERVA_DEVELOPMENT ||
    process.env.ZERVA_VITE ||
    process.env.NODE_MODE === "development"

  if (isDevMode) {
    if (!existsSync(rootPath)) {
      log.error(`vite project does not exist at ${rootPath}`)
    }
  } else {
    if (!existsSync(wwwPath)) {
      log.error(`web files do not exist at ${wwwPath}`)
    }
  }

  on("httpWillStart", async ({ addStatic, app }) => {
    if (isDevMode) {
      log.info(`serving through vite from ${rootPath}`)

      const vite = await createServer({
        root: rootPath,
        server: {
          middlewareMode: "html",
        },
      })
      app?.use(vite.middlewares)
    } else {
      log.info(`serving static files at ${wwwPath}}`)
      addStatic("", wwwPath)

      // Map dynamic routes to index.html
      app?.get(/.*/, (req: any, res: any) => {
        log("req.path", req.path)
        res.sendFile(resolve(wwwPath, "index.html"))
      })
    }
  })
}
