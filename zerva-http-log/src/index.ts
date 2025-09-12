import { createWriteStream } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import process from 'node:process'
import { use } from '@zerva/core'
import morgan from 'morgan'
import { createRotationStream, ensureFolder, getLogFileRotationConfigSchemaOptions, getLogRotationConfig, z } from 'zeed'
import '@zerva/http'

export const moduleName = 'http-log'

export const configSchema = z.object({
  path: z.string().default('access.log').meta({ desc: 'Path to log file. Intermediate folders will be created.' }),
  format: z.string().default('combined').meta({ desc: 'Log format, see morgan formats.' }),
  rotate: z.union(getLogFileRotationConfigSchemaOptions(true)).default(false).meta({ desc: 'Enable log rotation with given options or true for defaults.' }),
})

export const useHttpLog = use({
  name: moduleName,
  requires: ['http'],
  configSchema,
  setup({ config, log, on, once }) {
    log('setup', config)
    on('httpInit', async ({ app }) => {
      const path = resolve(process.cwd(), config.path)
      log('logging to', path)
      await ensureFolder(dirname(path))
      const rotate = getLogRotationConfig(config.rotate)
      log('log rotation', rotate)
      const stream = rotate
        ? createRotationStream(basename(path), {
            path: dirname(path),
            ...rotate,
          })
        : createWriteStream(path, { flags: 'a' })
      app.use(morgan(config.format ?? 'combined', { stream }))
    })
  },
})
