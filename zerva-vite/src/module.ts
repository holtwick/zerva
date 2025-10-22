import type { InlineConfig } from 'vite'
import type { LogConfig } from 'zeed'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import { use } from '@zerva/core'
import { escapeRegExp, isFile, isFolder, regExpEscape, toHumanReadableFilePath, toPath, z } from 'zeed'
import { zervaMultiPageAppIndexRouting } from './multi'
import '@zerva/http'

const configSchema = z.object({
  log: z.any<LogConfig>().optional(),
  root: z.string().default(process.cwd()).describe('Path to Vite project root (development mode)'),
  www: z.string().default('./dist_www').describe('Path to built web files (production mode)'),
  mode: z.string().default((process.env.ZERVA_DEVELOPMENT ? 'development' : 'production')),
  subpath: z.string().default('').describe('Subpath prefix for multi-page apps'),
  // hmr: z.boolean().default(true),
  assetsPath: z.string().default('assets').describe('Path prefix for static assets'),
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
      cacheExtensions,
      subpath,
      assetsPath,
    } = config

    // Create regex pattern from cacheExtensions config
    // Security: Use non-greedy match and anchor to prevent ReDoS
    const extensions = cacheExtensions.split(',').map(escapeRegExp).join('|')
    const cacheableExtensionsRegex = new RegExp(`\\.(?:${extensions})$`)

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

    // Normalize wwwPath for security checks
    const normalizedWwwPath = resolve(wwwPath)

    /**
     * Security: Validate that a file path is within wwwPath to prevent path traversal
     */
    function isPathSafe(requestedPath: string): boolean {
      try {
        const normalized = resolve(normalizedWwwPath, requestedPath)
        return normalized.startsWith(normalizedWwwPath)
      }
      catch {
        return false
      }
    }

    /**
     * Security: Normalize request path to prevent cache poisoning
     */
    function normalizePath(path: string): string {
      // Remove duplicate slashes, normalize dots
      return path.replace(/\/+/g, '/').replace(/\/\.\//g, '/').replace(/\/\.$/, '/')
    }

    on('httpWillStart', async ({ app }) => {
      const viteStaticPattern = new RegExp(`^/${regExpEscape(subpath.replace(/^\//, '').replace(/\/$/, ''))}.*$`)
      const viteStaticAssetsPattern = new RegExp(`^/${regExpEscape(assetsPath.replace(/^\//, '').replace(/\/$/, ''))}/.*$`)

      log('Vite handling', { viteStaticPattern, viteStaticAssetsPattern })

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

        app?.use([viteStaticPattern, viteStaticAssetsPattern], vite.middlewares)

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

        // Security: Limit cache size to prevent memory exhaustion
        const MAX_CACHE_ENTRIES = 1000
        let cacheEntryCount = 0

        function addToCache<T>(cache: Record<string, T>, key: string, value: T): void {
          if (cacheEntryCount >= MAX_CACHE_ENTRIES) {
            // Simple eviction: clear oldest entries (clear all for simplicity)
            Object.keys(cache).forEach(k => delete cache[k])
            cacheEntryCount = 0
            log.warn('Cache limit reached, cleared cache')
          }
          cache[key] = value
          cacheEntryCount++
        }

        const handler = async (req: any, res: any, next: any) => {
          log('Request received:', req.path)

          // Security: Normalize path to prevent cache poisoning and path traversal
          const rawPath = String(req.path)
          const path = normalizePath(rawPath)

          // Security: Reject paths with suspicious patterns
          if (path.includes('..') || path.includes('//') || path.includes('\0')) {
            log.warn(`Rejected suspicious path: ${rawPath}`)
            next()
            return
          }

          log.debug(`GET ${path}`)

          // Try to find static file first (before checking HTML cache)
          let filePath: string | undefined = cacheFilePath[path]
          if (filePath == null) {
            // Security: Prevent path traversal
            const requestedPath = path.slice(1) // Remove leading slash

            if (!isPathSafe(requestedPath)) {
              log.warn(`Path traversal attempt rejected: ${path}`)
              next()
              return
            }

            filePath = resolve(wwwPath, requestedPath)

            // Double-check the resolved path is safe
            if (!filePath.startsWith(normalizedWwwPath)) {
              log.warn(`Path escape attempt rejected: ${path}`)
              next()
              return
            }

            if (await isFile(filePath)) {
              addToCache(cacheFilePath, path, filePath)
            }
            else {
              filePath = undefined
            }
          }

          // Serve static file if found
          if (filePath != null) {
            // Security: Verify file is still within wwwPath before serving
            if (!filePath.startsWith(normalizedWwwPath)) {
              log.error(`Security: Attempted to serve file outside wwwPath: ${filePath}`)
              next()
              return
            }

            // Set long cache headers for static assets
            if (cacheAssets && (path.includes('/assets/') || cacheableExtensionsRegex.test(path))) {
              res.setHeader('Cache-Control', 'max-age=31536000, immutable')
            }
            res.sendFile(filePath)
            log(`... static file`)
            return
          }

          // Find index.html
          const parts = path.split('/').slice(1).filter(p => p.length > 0)
          let indexFilePath: string | undefined

          // Check HTML cache first (only for non-asset paths)
          let content = cacheIndexHtmlContent[path]
          if (content != null) {
            if (!res.headersSent) {
              log(`... from cache`)
              res.type('html').send(content)
            }
            else {
              log.warn(`Headers already sent for ${path}, skipping cached index.html response`)
            }
            return
          }

          // Security: Limit traversal depth to prevent DoS
          const maxDepth = Math.min(parts.length, 10)

          for (let i = maxDepth; i >= 0; i--) {
            const testParts = parts.slice(0, i)
            const testPath = resolve(wwwPath, ...testParts, 'index.html')

            // Security: Ensure path is still within wwwPath
            if (!testPath.startsWith(normalizedWwwPath)) {
              continue
            }

            if (await isFile(testPath)) {
              indexFilePath = testPath
              break
            }
          }

          if (!indexFilePath)
            indexFilePath = resolve(wwwPath, 'index.html')

          // Security: Final check that index.html is within wwwPath
          if (indexFilePath && !indexFilePath.startsWith(normalizedWwwPath)) {
            log.error(`Security: index.html path escaped wwwPath: ${indexFilePath}`)
            next()
            return
          }

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
          // Security: Escape HTML in injected content to prevent XSS
          if (config.injectHead) {
            // Note: We trust config values but add warning if they look suspicious
            if (config.injectHead.includes('<script') && !config.injectHead.includes('nonce')) {
              log.warn('injectHead contains <script> without nonce - potential XSS risk')
            }
            content = content.replace(
              '</head>',
              `  ${config.injectHead}\n</head>`,
            )
          }
          if (config.injectBody) {
            if (config.injectBody.includes('<script') && !config.injectBody.includes('nonce')) {
              log.warn('injectBody contains <script> without nonce - potential XSS risk')
            }
            content = content.replace(
              '</body>',
              `  ${config.injectBody}\n</body>`,
            )
          }

          // Cache content for future requests (use normalized path as key)
          addToCache(cacheIndexHtmlContent, path, content)

          log(`... index.html`)

          // Check if headers were already sent (by another middleware/handler)
          if (res.headersSent) {
            log.warn(`Headers already sent for ${path}, skipping index.html response`)
            return
          }

          res.type('html').send(content)
        }

        app?.get(viteStaticAssetsPattern, handler)
        app?.get(viteStaticPattern, handler)
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
