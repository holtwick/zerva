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

      result = handler
      if (typeof handler === 'function') {
        const reqX = req as any
        reqX.req = req
        result = await promisify(handler(reqX, res, () => {
          log.warn('next() call is ignored in zerva-http handlers')
        }))
      }

      // If the handler already sent the response (headers + content), dump headers for debugging
      // and avoid attempting to set headers or send content again (which would throw an error)
      if (res.headersSent) {
        try {
          const dumpInfo: any = {
            statusCode: (res as any).statusCode,
            headers: typeof (res as any).getHeaders === 'function'
              ? (res as any).getHeaders()
              : (res as any)._headers ?? (res as any).headers,
            handlerResult: result,
          }
          log.warn(`${modeUpper} ${path} - Response already sent by handler. Headers dump:`, dumpInfo)
        }
        catch (dumpErr) {
          log.warn(`${modeUpper} ${path} - Response already sent by handler, failed to dump headers`, dumpErr)
        }
        return
      }

      if (result != null) {
        // Handle [status, body] tuple format
        if (Array.isArray(result) && result.length === 2 && typeof result[0] === 'number') {
          if (!res.headersSent) {
            res.status(result[0])
          }
          else {
            log.warn(`${modeUpper} ${path} - Cannot set status ${result[0]} from tuple, headers already sent`)
          }
          result = result[1]
        }

        if (typeof result === 'number') {
          if (!res.headersSent) {
            res.status(result).send(String(result))
          }
          else {
            log.warn(`${modeUpper} ${path} - Cannot send numeric result, headers already sent`)
          }
          return
        }

        // Set content type based on suffix if not already set
        if (suffix && !res.headersSent) {
          res.type(suffix)
        }
        else if (suffix && res.headersSent) {
          log.warn(`${modeUpper} ${path} - Cannot set content-type from suffix, headers already sent`)
        }

        // Auto-detect content type for string results
        if (typeof result === 'string' && !suffix && !res.headersSent) {
          res.set('Content-Type', result.startsWith('<')
            ? 'text/html; charset=utf-8'
            : 'text/plain; charset=utf-8')
        }
        else if (typeof result === 'string' && !suffix && res.headersSent) {
          log.warn(`${modeUpper} ${path} - Cannot auto-detect content-type, headers already sent`)
        }

        if (!res.headersSent) {
          res.send(result)
        }
        else {
          log.warn(`${modeUpper} ${path} - Cannot send result, headers already sent. Result type: ${typeof result}`)
        }
        return
      }
    }
    catch (err) {
      log.warn(`Problems setting status or header automatically for ${path}`, err)
    }

    if (!res.headersSent) {
      res.status(500).send('No response')
    }
    else {
      log.warn(`${modeUpper} ${path} - Cannot send 500 error response, headers already sent`)
    }
  })

  return {
    description(description: string) {
      route.description = description
    },
  }
}
