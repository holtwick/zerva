// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.

import {
  Logger,
  on,
  register,
  toHumanReadableFilePath,
  toPath,
} from "@zerva/core"
import "@zerva/http"
import { existsSync } from "fs"
import { resolve } from "path"
import { zervaMultiPageAppIndexRouting } from "./multi"

const name = "vite"
const log = Logger(`zerva:${name}`)

export function useVite(config?: { root?: string; www?: string }) {
  // log.info(`use ${name} ${process.env.ZERVA}`)
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
      console.info(
        `Zerva: Vite serving from ${toHumanReadableFilePath(rootPath)}`
      )
      // log.info(`serving through vite from ${rootPath}`)

      // Lazy load, because it is only used in dev mode and confuses
      // in prod mode ;)
      const { createServer } = await import("vite")

      const vite = await createServer({
        root: rootPath,
        server: {
          middlewareMode: true,
        },
        plugins: [zervaMultiPageAppIndexRouting()],
      })

      app?.use(vite.middlewares)
    } else {
      console.info(
        `Zerva: Vite serving from ${toHumanReadableFilePath(wwwPath)}`
      )
      // log.info(`serving static files at ${wwwPath}}`)
      addStatic("", wwwPath)

      //  // https://github.com/vitejs/vite/issues/4042
      //   if (config?.inputs?.length) {
      //     app.use(async (req: any, res: any, next: any) => {
      //       for (const appName in config.inputs) {
      //         if (req.originalUrl.startsWith(`/${appName}`)) {
      //           req.url = `/${appName}/index.html`
      //           break
      //         }
      //       }
      //       next()
      //     })
      //   }

      // Map dynamic routes to index.html
      app?.get(/.*/, (req: any, res: any) => {
        log("req.path", req.path)
        res.sendFile(resolve(wwwPath, "index.html"))
      })
    }
  })
}
