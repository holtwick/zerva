import { use } from '@zerva/core'
import { isRecord, size, z } from 'zeed'
import { getCredentials } from './auth'
import '@zerva/http'

export * from './htpasswd-md5'

const name = 'basic-auth'

// declare global {
//   interface ZContextEvents {
//     basicAuth(info: { keycloak: Keycloak; app: Express }): void
//   }
// }

const configSchema = z.object({
  routes: z.array(z.string()).default(['/']).meta({ envSkip: true }),
  auth: z.union([
    z.record(z.string()),
    z.func([z.string(), z.string()], z.boolean()),
  ]).optional().meta({ envSkip: true }),
  logout: z.string().optional(),
  realm: z.string().default('default'),
  waitSecondsBetweenAuthorization: z.number().default(1),
})

// interface ZervaBasicAuthConfig {
//   routes?: any[]
//   auth?: Record<string, string> | ((user: string, password: string) => boolean)
//   logout?: string
//   realm?: string
//   waitSecondsBetweenAuthorization?: number
// }

export const useBasicAuth = use({
  name,
  requires: ['http'],
  configSchema,
  setup({ log, config, on }) {
    const {
      routes = ['/'],
      auth,
      logout,
      realm = 'default',
      waitSecondsBetweenAuthorization = 1,
    } = config ?? {}

    if (auth == null || (isRecord(auth) && size(auth) <= 0))
      log.error('No user credentials found!')

    function doCheckCredentials(user: string, password: string) {
      if (auth == null)
        return false
      if (typeof auth === 'function')
        return auth(user, password)
      return auth[user] === password
    }

    function doReturnError(res: any) {
      res.statusCode = 401
      res.setHeader('WWW-Authenticate', `Basic realm="${realm}"`)
    }

    // 1. Register middleware
    on('httpInit', ({ app }) => {
      // https://stackoverflow.com/a/46475726/140927
      app.enable('trust proxy')

      // app.use(
      //   // https://regex101.com/r/Jieut9/1
      //   /^(.*(?<!(check|\.(png|jpg|ico|json|xml|webmanifest|svg|woff|woff2|css))))$/,
      //   keycloak.protect()
      // )

      // todo does not accept reentering of credentials
      if (logout) {
        app.use(logout, (_req: any, res: any, _next: any) => {
          doReturnError(res)
          res.end('You have successfully logged out')
        })
      }

      let lastTry = 0

      routes.forEach((route) => {
        app.use(route, (req: any, res: any, next: any) => {
          const credentials = getCredentials(req)

          if (credentials && (credentials.user.length || credentials.password.length)) {
            // Credentials ok? Go for it!
            if (doCheckCredentials(credentials.user, credentials.password)) {
              log.debug(`Access granted for "${credentials.user}"`)
              const _req = req
              _req.user = credentials.user
              next()
              return
            }

            log('Wrong credentials', credentials)

            // Prevent brute force
            if (waitSecondsBetweenAuthorization > 0) {
              const now = Date.now()
              if ((now - lastTry) < (waitSecondsBetweenAuthorization * 1000)) {
                log.warn('Rate limit reached!')
                doReturnError(res)
                res.end('Please try again later')
                return
              }
              lastTry = now
            }
          }

          doReturnError(res)
          res.end('Access denied')
        })
      })
    })
  },
})
