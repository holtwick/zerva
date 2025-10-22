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

        if (result == null && res.headersSent) {
          log.info(`response already sent by handler for ${path}`)
          return
        }
      }

      // If the handler already sent the response (headers + content), dump headers for debugging
      // and avoid attempting to set headers or send content again (which would throw an error)
      if (res.headersSent) {
        try {
          // Safely serialize handlerResult - avoid exposing sensitive data and prevent circular ref crashes
          let safeResult: any
          try {
            // Only include result type and basic info, not the actual data which might be sensitive
            if (result === null || result === undefined) {
              safeResult = result
            }
            else if (typeof result === 'string') {
              safeResult = `[string: ${result.length} chars]`
            }
            else if (typeof result === 'number' || typeof result === 'boolean') {
              safeResult = result
            }
            else if (Array.isArray(result)) {
              safeResult = `[array: ${result.length} items]`
            }
            else if (typeof result === 'object') {
              safeResult = `[object: ${Object.keys(result).length} keys]`
            }
            else {
              safeResult = typeof result
            }
          }
          catch {
            safeResult = '[unable to serialize]'
          }

          const dumpInfo: any = {
            statusCode: (res as any).statusCode,
            headers: typeof (res as any).getHeaders === 'function'
              ? (res as any).getHeaders()
              : (res as any)._headers ?? (res as any).headers,
            handlerResultType: safeResult,
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
          const statusCode = result[0]

          // Validate status code is in valid HTTP range
          if (statusCode < 100 || statusCode > 599 || !Number.isInteger(statusCode)) {
            log.warn(`${modeUpper} ${path} - Invalid status code ${statusCode}, defaulting to 500`)
            if (!res.headersSent) {
              res.status(500)
            }
          }
          else if (!res.headersSent) {
            res.status(statusCode)
          }
          else {
            log.warn(`${modeUpper} ${path} - Cannot set status ${statusCode} from tuple, headers already sent`)
          }

          result = result[1]
        }

        if (typeof result === 'number') {
          // Validate numeric status code
          if (result < 100 || result > 599 || !Number.isInteger(result)) {
            log.warn(`${modeUpper} ${path} - Invalid numeric status ${result}, defaulting to 500`)
            if (!res.headersSent) {
              res.status(500).send('Invalid status code')
            }
            else {
              log.warn(`${modeUpper} ${path} - Cannot send numeric result, headers already sent`)
            }
          }
          else if (!res.headersSent) {
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
        // Note: Basic XSS protection - proper sanitization should be done by the application
        if (typeof result === 'string' && !suffix && !res.headersSent) {
          // More robust HTML detection - check for common HTML patterns
          const looksLikeHTML = result.trim().startsWith('<')
            && (result.includes('</') || result.includes('/>'))

          res.set('Content-Type', looksLikeHTML
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
