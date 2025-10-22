import type { InlineConfig } from 'vite'
import type { LogConfig } from 'zeed'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import { use } from '@zerva/core'
import { isFile, isFolder, regExpEscape, toHumanReadableFilePath, toPath, z } from 'zeed'
import { zervaMultiPageAppIndexRouting } from './multi'
import '@zerva/http'

const configSchema = z.object({
  log: z.any<LogConfig>().optional(),
  root: z.string().default(process.cwd()).describe('Path to Vite project root (development mode)'),
  www: z.string().default('./dist_www').describe('Path to built web files (production mode)'),
  mode: z.string().default((process.env.ZERVA_DEVELOPMENT ? 'development' : 'production')),
  cacheAssets: z.boolean().default(true).describe('Cache static assets in the browser for 1 year with immutable header'),
  cacheExtensions: z.string().default('png,ico,svg,jpg,pdf,jpeg,mp4,mp3,woff2,ttf,tflite').describe('File extensions to cache when cacheAssets is true'),
  injectHead: z.string().optional().describe('HTML to inject before </head>. Only in production mode.'),
  injectBody: z.string().optional().describe('HTML to inject before </body>. Only in production mode.'),
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

    const {
      root,
      www,
      mode,
      cacheAssets,
    } = config

    const rootPath = toPath(root)
    const wwwPath = toPath(www)

    if (ZERVA_DEVELOPMENT) {
      if (!isFolder(rootPath))
        log.error(`vite project does not exist at ${rootPath}`)
    }
    else {
      if (!isFolder(wwwPath))
        log.error(`web files do not exist at ${wwwPath}`)
    }

    // Normalize wwwPath for path validation
    const normalizedWwwPath = resolve(wwwPath)

    on('httpWillStart', async ({ app }) => {
      if (ZERVA_DEVELOPMENT) {
        log.info(`Vite development serving from ${toHumanReadableFilePath(rootPath)}`)

        // Lazy load, because it is only used in dev mode and confuses in prod mode ;)
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

        app?.get(/.*/, vite.middlewares)

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
        log.info(`Vite production serving from ${toHumanReadableFilePath(wwwPath)}`)

        app?.get(/.*/, async (req: any, res: any, next: any) => {
          const path = String(req.path)
          log.debug(`GET ${path}`)

          const requestedPath = path.slice(1) // Remove leading slash
          const filePath = resolve(wwwPath, requestedPath)

          // Ensure path is within wwwPath
          if (!filePath.startsWith(normalizedWwwPath)) {
            log.warn(`Path outside wwwPath rejected: ${path}`)
            next()
            return
          }

          // Try to serve static file
          if (await isFile(filePath)) {
            // Set long cache for all files except index.html
            if (cacheAssets && !filePath.endsWith('index.html')) {
              res.setHeader('Cache-Control', 'max-age=31536000, immutable')
            }
            res.sendFile(filePath)
            log(`Served: ${filePath}`)
            return
          }

          // Search for index.html in path hierarchy
          const parts = path.split('/').filter(p => p.length > 0)

          for (let i = parts.length; i >= 0; i--) {
            const testParts = parts.slice(0, i)
            const testPath = resolve(wwwPath, ...testParts, 'index.html')

            if (!testPath.startsWith(normalizedWwwPath))
              continue

            if (await isFile(testPath)) {
              let content = await readFile(testPath, 'utf-8')

              // Inject HTML if configured
              if (config.injectHead) {
                content = content.replace('</head>', `  ${config.injectHead}\n</head>`)
              }
              if (config.injectBody) {
                content = content.replace('</body>', `  ${config.injectBody}\n</body>`)
              }

              res.type('html').send(content)
              log(`Served index.html: ${testPath}`)
              return
            }
          }

          // No file found, pass to next handler
          next()
        })
      }
    })

    // Return configuration info for testing and introspection
    return {
      name: 'vite',
      config,
      paths: {
        root: rootPath,
        www: wwwPath,
      },
    }
  },
})
