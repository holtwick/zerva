import type { Options } from 'rotating-file-stream'

import { createWriteStream } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { on } from '@zerva/core'
import morgan from 'morgan'
import { createStream as createStreamRotate } from 'rotating-file-stream'
import { ensureFolder } from 'zeed'
import '@zerva/http'

/** Log http requests in Apache style */
export function useHttpLog(opt?: {
  filename?: string
  path?: string
  format?: string
  rotate?: Options | boolean
  size?: string
  interval?: string
  compress?: string
}) {
  on('httpInit', async ({ app }) => {
    const filename = opt?.filename ?? 'access.log'
    const path = resolve(process.cwd(), opt?.path ?? 'logs')
    await ensureFolder(path)
    const stream = opt?.rotate
      ? createStreamRotate(filename, {
          path,
          size: opt?.size ?? '10M', // rotate every 10 MegaBytes written
          interval: opt?.interval ?? '1d', // rotate daily
          compress: opt?.compress ?? 'gzip', // compress rotated files
          ...(opt.rotate === true ? {} : opt.rotate),
        })
      : createWriteStream(resolve(path, filename), {
          flags: 'a',
        })
    app.use(morgan(opt?.format ?? 'combined', { stream }))
  })
}
