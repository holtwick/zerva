/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.

import '@zerva/http'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createServer } from 'vite'
import { Logger, on, register, toPath, valueToBoolean } from 'zerva'

const name = 'vite'
const log = Logger(`zerva:${name}`)

declare global {
  interface ZContextEvents {
    viteSsrInvalidateCache(): void
  }
}

interface Config {
  root: string
  cache?: boolean
}

export function useViteSsr(config: Config) {
  log.info(`use ${name} ${process.env.ZERVA}`)
  register(name, ['http'])

  const cache = new Map()
  on('viteSsrInvalidateCache', () => {
    cache.clear()
  })

  const { root, cache: shouldUseCache = true } = config
  const rootPath = toPath(root)

  const isProd = valueToBoolean(process.env.ZERVA_PRODUCTION) || process.env.NODE_MODE === 'production'

  on('httpWillStart', async ({ app }) => {
    log.info(`isProd=${isProd}`)
    log.info(`serving through vite from ${rootPath}`)

    if (!isProd) {
      const vite = await createServer({
        root: rootPath,
        server: {
          middlewareMode: true, // "ssr",
        },
      })
      app.use(vite.middlewares)
      app.use('*', async (req: any, res: any) => {
        const url = req.originalUrl
        log(`handle ${url}`)

        try {
          let template = readFileSync(resolve('index.html'), 'utf-8')
          template = await vite.transformIndexHtml(url, template)
          const { render } = await vite.ssrLoadModule('/src/entry-server.ts')
          const appHtml = await render(url, {})
          const html = template.replace(/<.*?id="app".*?>.*?<\//gi, m =>
            m.replace('</', `${appHtml}</`),
          )
          res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
        }
        catch (e: any) {
          vite.ssrFixStacktrace(e)
          log.error(e)
          res.status(500).end(e.message)
        }
      })
    }

    if (isProd) {
      app.use(require('compression')())
      app.use(
        require('serve-static')(resolve('dist/client'), {
          index: false,
        }),
      )

      // addStatic("/assets", resolve("./dist/client/assets"))

      const template = readFileSync(resolve('dist/client/index.html'), 'utf-8')
      const manifest = require('./dist/client/ssr-manifest.json')
      const { render } = require('./dist/server/entry-server')

      app.use('*', async (req: any, res: any) => {
        const url = req.originalUrl
        log(`prod handle ${url}`)

        try {
          let html = cache.get(url)
          if (!shouldUseCache || html == null) {
            const appHtml = await render(url, manifest)
            html = template.replace(/<.*?id="app".*?>.*?<\//gi, m =>
              m.replace('</', `${appHtml}</`),
            )
            cache.set(url, html)
          }
          res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
        }
        catch (e: any) {
          log.error(e)
          res.status(500).end(e.message)
        }
      })
    }
  })
}
