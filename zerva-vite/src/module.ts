import type { InlineConfig } from 'vite'
import type { LogConfig } from 'zeed'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import { use } from '@zerva/core'
import { escapeRegExp, isFile, isFolder, toHumanReadableFilePath, toPath, z } from 'zeed'
import { zervaMultiPageAppIndexRouting } from './multi'
import '@zerva/http'

const configSchema = z.object({
  log: z.any<LogConfig>().optional(),
  root: z.string().default(process.cwd()).describe('Path to Vite project root (development mode)'),
  www: z.string().default('./dist_www').describe('Path to built web files (production mode)'),
  mode: z.string().default((process.env.ZERVA_DEVELOPMENT ? 'development' : 'production')),
  // hmr: z.boolean().default(true),
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

    const { root, www, mode, cacheAssets, cacheExtensions } = config

    // Create regex pattern from cacheExtensions config
    const cacheableExtensionsRegex = new RegExp(`.*\\.(?:${cacheExtensions.split(',').map(escapeRegExp).join('|')})$`)

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

    on('httpWillStart', async ({ app }) => {
      if (ZERVA_DEVELOPMENT) {
        log.info(`Vite serving from ${toHumanReadableFilePath(rootPath)}`)
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
        log.info(`Vite serving from ${toHumanReadableFilePath(wwwPath)}`)

        const cacheIndexHtmlContent: Record<string, string> = {}
        const cacheFilePath: Record<string, string> = {}

        // Map dynamic routes to index.html
        app?.get(/.*/, async (req: any, res: any, next: any) => {
          const path = String(req.path)

          log.debug(`GET ${path}`)

          // In cache, serve from cache
          let content = cacheIndexHtmlContent[path]
          if (content != null) {
            if (!res.headersSent) {
              log(`... from cache`)
              res.type('html').send(content)
            }
            else {
              log.warn(`Headers already sent for ${req.path}, skipping cached index.html response`)
            }
            return
          }

          // Try to find static file
          let filePath: string | undefined = cacheFilePath[path]
          if (filePath == null) {
            filePath = resolve(wwwPath, path.slice(1))
            if (await isFile(filePath)) {
              cacheFilePath[path] = filePath
            }
            else {
              filePath = undefined
            }
          }

          // Serve static file if found
          if (filePath != null) {
            // Set long cache headers for static assets
            if (cacheAssets && (path.includes('/assets/') || cacheableExtensionsRegex.test(req.path))) {
              res.setHeader('Cache-Control', 'max-age=31536000, immutable')
            }
            res.sendFile(filePath)
            log(`... static file`)
            return
          }

          // Find index.html
          const parts = path.split('/').slice(1)
          let indexFilePath: string | undefined
          while (parts.length > 0) {
            const testPath = resolve(wwwPath, ...parts, 'index.html')
            if (await isFile(testPath)) {
              indexFilePath = testPath
              break
            }
            parts.pop()
          }

          if (!indexFilePath)
            indexFilePath = resolve(wwwPath, 'index.html')

          // If no index.html exists, give other handlers a chance
          if (!await isFile(indexFilePath)) {
            next()
            return
          }

          // Load file
          try {
            content = await readFile(indexFilePath, 'utf-8')
          }
          catch (err) {
            log.error(`Error reading ${indexFilePath}:`, err)
            res.status(404).send('Not found')
            return
          }

          // Inject HTML if needed
          if (config.injectHead) {
            content = content.replace(
              '</head>',
              `  ${config.injectHead}\n</head>`,
            )
          }
          if (config.injectBody) {
            content = content.replace(
              '</body>',
              `  ${config.injectBody}\n</body>`,
            )
          }

          // Cache content for future requests
          cacheIndexHtmlContent[req.path] = content

          log(`... index.html`)

          // Check if headers were already sent (by another middleware/handler)
          if (res.headersSent) {
            log.warn(`Headers already sent for ${req.path}, skipping index.html response`)
            return
          }

          res.type('html').send(content)
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
