import type { LogConfig } from 'zeed'
import process from 'node:process'
import { use } from '@zerva/core'
import { isFolder, toHumanReadableFilePath, toPath, z } from 'zeed'
import { setupProduction } from './production'
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

export const useVite = use({
  name: 'vite',
  requires: ['http'],
  configSchema,
  setup({ log, config, on }) {
    const { root, www, mode, cacheAssets } = config

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
        log.info(`Vite development serving from ${toHumanReadableFilePath(rootPath)}`)
        const { setupDevelopment } = await import('./development')
        await setupDevelopment(app, rootPath, mode, log, on)
      }
      else {
        log.info(`Vite production serving from ${toHumanReadableFilePath(wwwPath)}`)
        setupProduction(app, {
          wwwPath,
          cacheAssets,
          injectHead: config.injectHead,
          injectBody: config.injectBody,
        }, log)
      }
    })

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
