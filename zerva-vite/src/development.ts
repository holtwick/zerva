import type { InlineConfig } from 'vite'
import type { LoggerInterface } from 'zeed'
import process from 'node:process'
import { zervaMultiPageAppIndexRouting } from './multi'

export async function setupDevelopment(
  app: any,
  rootPath: string,
  mode: string,
  log: LoggerInterface,
  on: (event: string, handler: () => Promise<void>) => void,
) {
  const { createServer } = await import('vite')

  const config: InlineConfig = {
    mode: process.env.ZERVA_MODE ?? mode,
    root: rootPath,
    server: {
      middlewareMode: true,
    },
    plugins: [zervaMultiPageAppIndexRouting()],
  }

  const vite = await createServer(config)

  app.get(/.*/, vite.middlewares)

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
