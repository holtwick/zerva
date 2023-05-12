// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.

import '@zerva/http'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { Logger, on, register, toHumanReadableFilePath, toPath } from '@zerva/core'
import { zervaMultiPageAppIndexRouting } from './multi'

const name = 'vite'
const log = Logger(`zerva:${name}`)

export function useVite(config?: { root?: string; www?: string }) {
  log.info(`use ${name} ${process.env.ZERVA}`)
  register(name, ['http'])

  const { root = process.cwd(), www = './dist_www' } = config ?? {}
  const rootPath = toPath(root)
  const wwwPath = toPath(www)

  const isDevMode = process.env.ZERVA_DEVELOPMENT || process.env.ZERVA_VITE || process.env.NODE_MODE === 'development'

  if (isDevMode) {
    if (!existsSync(rootPath))
      log.error(`vite project does not exist at ${rootPath}`)
  }
  else {
    if (!existsSync(wwwPath))
      log.error(`web files do not exist at ${wwwPath}`)
  }

  on('httpWillStart', async ({ addStatic, app }) => {
    if (isDevMode) {
      // eslint-disable-next-line no-console
      console.info(`Zerva: Vite serving from ${toHumanReadableFilePath(rootPath)}`)
      // log.info(`serving through vite from ${rootPath}`)

      // Lazy load, because it is only used in dev mode and confuses
      // in prod mode ;)
      const { createServer } = await import('vite')

      const vite = await createServer({
        root: rootPath,
        server: {
          middlewareMode: true,
        },
        plugins: [zervaMultiPageAppIndexRouting()],
      })

      app?.use(vite.middlewares)

      on('httpStop', async () => {
        log('vite close')
        await vite.close()
      })
    }
    else {
      // eslint-disable-next-line no-console
      console.info(`Zerva: Vite serving from ${toHumanReadableFilePath(wwwPath)}`)
      // log.info(`serving static files at ${wwwPath}}`)
      addStatic('', wwwPath)

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
