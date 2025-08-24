import type { InlineConfig } from 'vite'
import type { LogConfig } from 'zeed'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { use } from '@zerva/core'
import { toHumanReadableFilePath, toPath, z } from 'zeed'
import { zervaMultiPageAppIndexRouting } from './multi'

import '@zerva/http'

// Constants for better maintainability
const CACHEABLE_EXTENSIONS = /.*\.(?:png|ico|svg|jpg|pdf|jpeg|mp4|mp3|woff2|ttf|tflite)$/

const configSchema = z.object({
  log: z.any<LogConfig>().optional(),
  root: z.string().default(process.cwd()),
  www: z.string().default('./dist_www'),
  mode: z.string().default((process.env.ZERVA_DEVELOPMENT ? 'development' : 'production')),
  // hmr: z.boolean().default(true),
  cacheAssets: z.boolean().default(true),
})

/**
 * Integrates Vite development server with Zerva
 *
 * In development mode, serves files through Vite dev server with HMR support.
 * In production mode, serves pre-built static files with proper caching headers.
 */
export const useVite = use({
  name: 'vite',
  requires: ['http'],
  configSchema,
  setup({ log, config, on }) {
    // const isDevMode = ZERVA_DEVELOPMENT || process.env.ZERVA_VITE || process.env.NODE_MODE === 'development'

    const { root, www, mode, cacheAssets } = config

    const rootPath = toPath(root)
    const wwwPath = toPath(www)

    if (ZERVA_DEVELOPMENT) {
      if (!existsSync(rootPath))
        log.error(`vite project does not exist at ${rootPath}`)
    }
    else {
      if (!existsSync(wwwPath))
        log.error(`web files do not exist at ${wwwPath}`)
    }

    on('httpWillStart', async ({ STATIC, app }) => {
      if (ZERVA_DEVELOPMENT) {
        // eslint-disable-next-line no-console
        console.info(`Zerva: Vite serving from ${toHumanReadableFilePath(rootPath)}`)
        // log.info(`serving through vite from ${rootPath}`)

        // Lazy load, because it is only used in dev mode and confuses
        // in prod mode ;)
        const { createServer } = await import('vite')

        const config: InlineConfig = {
          mode: process.env.ZERVA_MODE ?? mode,
          root: rootPath,
          server: {
            middlewareMode: true,
          },
          plugins: [zervaMultiPageAppIndexRouting()],
        }

        // if (hmr === false && config.server != null)
        //   config.server.hmr = false

        const vite = await createServer(config)

        app?.use(vite.middlewares)

        on('httpStop', async () => {
          log('vite close')
          try {
            await vite.close()
            await vite.ws?.close()
          }
          catch (err) {
            log.warn('Error closing Vite server:', err)
          }
        })
      }
      else {
        // eslint-disable-next-line no-console
        console.info(`Zerva: Vite serving from ${toHumanReadableFilePath(wwwPath)}`)
        // log.info(`serving static files at ${wwwPath}}`)
        STATIC('', wwwPath)

        const multiInputCache: Record<string, string> = {}

        // Cache static assets
        if (cacheAssets) {
          app.use((req, res, next) => {
            const path = req.path
            if (path.includes('/assets/') || CACHEABLE_EXTENSIONS.test(req.path)) {
              res.setHeader('Cache-Control', 'max-age=31536000, immutable')
            }
            next()
          })
        }

        // Map dynamic routes to index.html
        app?.get(/.*/, (req: any, res: any) => {
          let path: string | undefined = multiInputCache[req.path]
          if (!path) {
            const parts = req.path.split('/').slice(1)
            while (parts.length > 0) {
              const testPath = resolve(wwwPath, ...parts, 'index.html')
              if (existsSync(testPath)) {
                path = testPath
                break
              }
              parts.pop()
            }
            if (!path)
              path = resolve(wwwPath, 'index.html')

            multiInputCache[req.path] = path
          }
          res.sendFile(path)
        })
      }
    })
  },
})
