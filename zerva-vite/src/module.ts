import '@zerva/http'

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { LoggerFromConfig, on, register } from '@zerva/core'
import type { LogConfig } from '@zerva/core'
import { LogLevelInfo, toHumanReadableFilePath, toPath } from 'zeed'
import { zervaMultiPageAppIndexRouting } from './multi'

const moduleName = 'vite'

export function useVite(config?: {
  log?: LogConfig
  root?: string
  www?: string
  mode?: string
}) {
  const log = LoggerFromConfig(config?.log ?? true, moduleName, LogLevelInfo)
  log(`use ${moduleName} ${process.env.ZERVA}`)
  register(moduleName, ['http'])

  const isDevMode = process.env.ZERVA_DEVELOPMENT || process.env.ZERVA_VITE || process.env.NODE_MODE === 'development' || process.env.ZERVA_MODE === 'development'

  const {
    root = process.cwd(),
    www = './dist_www',
    mode = process.env.MODE || (isDevMode ? 'development' : 'production'),
  } = config ?? {}

  const rootPath = toPath(root)
  const wwwPath = toPath(www)

  if (isDevMode) {
    if (!existsSync(rootPath))
      log.error(`vite project does not exist at ${rootPath}`)
  }
  else {
    if (!existsSync(wwwPath))
      log.error(`web files do not exist at ${wwwPath}`)
  }

  on('httpWillStart', async ({ STATIC, app }) => {
    if (isDevMode) {
      // eslint-disable-next-line no-console
      console.info(`Zerva: Vite serving from ${toHumanReadableFilePath(rootPath)}`)
      // log.info(`serving through vite from ${rootPath}`)

      // Lazy load, because it is only used in dev mode and confuses
      // in prod mode ;)
      const { createServer } = await import('vite')

      const vite = await createServer({
        mode,
        root: rootPath,
        server: {
          middlewareMode: true,
        },
        plugins: [zervaMultiPageAppIndexRouting()],
      })

      app?.use(vite.middlewares)

      on('httpStop', async () => {
        log('vite close')
        try {
          await vite.close()
          await vite.ws?.close()
        }
        catch (err) {

        }
      })
    }
    else {
      // eslint-disable-next-line no-console
      console.info(`Zerva: Vite serving from ${toHumanReadableFilePath(wwwPath)}`)
      // log.info(`serving static files at ${wwwPath}}`)
      STATIC('', wwwPath)

      const multiInputCache: Record<string, string> = {}

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
}
