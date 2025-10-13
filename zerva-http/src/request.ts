import type { Request, Response } from 'express'
import type { LoggerInterface } from 'zeed'
import type { Express, zervaHttpGetHandler, zervaHttpHandlerMetohod, zervaHttpPaths, ZervaHttpRouteDescription } from './types'
import { isString, promisify } from 'zeed'

export function smartRequestHandler(opt: {
  method: zervaHttpHandlerMetohod
  path: zervaHttpPaths
  handler: zervaHttpGetHandler
  app: Express
  routes: ZervaHttpRouteDescription[]
  log: LoggerInterface
}) {
  let { method, path, handler, app, routes, log } = opt

  if (isString(path) && !path.startsWith('/'))
    path = `/${path}`

  const route: ZervaHttpRouteDescription = { path: String(path), method, description: '' }
  routes.push(route)

  const modeUpper = method.toUpperCase()
  log(`register ${modeUpper} ${path}`)

  let suffix: string | undefined
  if (isString(path))
    suffix = /\.[a-z0-9]+$/.exec(path)?.[0]

  app[method](path, async (req: Request, res: Response) => {
    // Next is not used any more, these are finite handlers
    // next()

    try {
      let result: any

      log(`${modeUpper} ${path}${path !== req.url ? ` -> ${req.url}` : ''}`)

      // Set content type based on suffix, could be changed later
      if (suffix)
        res.type(suffix)

      result = handler
      if (typeof handler === 'function') {
        const reqX = req as any
        reqX.req = req
        result = await promisify(handler(reqX, res, () => {
          log.warn('next() call is ignored in zerva-http handlers')
        }))
      }

      if (result != null) {
        // Handle [status, body] tuple format
        if (Array.isArray(result) && result.length === 2 && typeof result[0] === 'number') {
          res.status(result[0])
          result = result[1]
        }

        if (typeof result === 'number') {
          res.status(result).send(String(result))
          return
        }

        // Auto-detect content type for string results
        if (typeof result === 'string' && !suffix) {
          res.set('Content-Type', result.startsWith('<')
            ? 'text/html; charset=utf-8'
            : 'text/plain; charset=utf-8')
        }

        res.send(result)
        return
      }
    }
    catch (err) {
      log.warn(`Problems setting status or header automatically for ${path}`, err)
    }

    res.status(500).send('No response')
  })

  return {
    description(description: string) {
      route.description = description
    },
  }
}
