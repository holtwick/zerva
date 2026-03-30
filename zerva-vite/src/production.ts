import type { LoggerInterface } from 'zeed'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { express } from '@zerva/http'
import { isFile } from 'zeed'

export interface ProductionServeConfig {
  wwwPath: string
  cacheAssets: boolean
  injectHead?: string
  injectBody?: string
}

export function setupProduction(app: any, config: ProductionServeConfig, log: LoggerInterface) {
  const { wwwPath, cacheAssets, injectHead, injectBody } = config
  const normalizedWwwPathPrefix = resolve(wwwPath) + '/'

  // Static file serving via express.static
  // index: false because we handle index.html ourselves (injection support + SPA fallback)
  app.use(express.static(wwwPath, {
    index: false,
    setHeaders(res: any, filePath: string) {
      if (cacheAssets && !filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'max-age=31536000, immutable')
      }
    },
  }))

  // Fallback: find the nearest index.html in the path hierarchy (SPA routing)
  app.get(/.*/, async (req: any, res: any, next: any) => {
    const parts = String(req.path).split('/').filter(Boolean)

    for (let i = parts.length; i >= 0; i--) {
      const testPath = resolve(wwwPath, ...parts.slice(0, i), 'index.html')

      if (!testPath.startsWith(normalizedWwwPathPrefix))
        continue

      if (await isFile(testPath)) {
        let content = await readFile(testPath, 'utf-8')

        if (injectHead)
          content = content.replace('</head>', `  ${injectHead}\n</head>`)
        if (injectBody)
          content = content.replace('</body>', `  ${injectBody}\n</body>`)

        res.type('html').send(content)
        log(`index.html: ${testPath}`)
        return
      }
    }

    next()
  })
}
