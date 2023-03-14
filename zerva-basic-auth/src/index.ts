import { on, register } from "@zerva/core"
import { isRecord, Logger, size } from "zeed"
import { getCredentials } from "./auth"
import '@zerva/http'

const name = "basic-auth"
const log = Logger(`zerva:${name}`)

// declare global {
//   interface ZContextEvents {
//     basicAuth(info: { keycloak: Keycloak; app: Express }): void
//   }
// }

interface ZervaBasicAuthConfig {
  routes?: any[]
  auth?: Record<string, string> | ((user:string, password:string) => boolean)
  logout?: string
  realm?: string
  waitSecondsBetweenAuthorization?: number
}

export function useBasicAuth(config?: ZervaBasicAuthConfig) {
  log.info(`use ${name}`)
  register(name, ["http"])

  const {
    routes = ['/'],
    auth,
    logout,
    realm = "default",
    waitSecondsBetweenAuthorization = 1
  } = config ?? {}

  if (auth == null || (isRecord(auth) && size(auth) <= 0)) log.error('No user credentials found!')

  function doCheckCredentials(user: string, password: string) {
    if (auth == null) 
      return false
    if (typeof auth === 'function')
      return auth(user,password)
    return auth[user] === password
  }

  function doReturnError(res: any) {
    res.statusCode = 401
    res.setHeader('WWW-Authenticate', `Basic realm="${realm}"`)
  }

  // 1. Register middleware
  on("httpInit", ({ app }) => {
    // https://stackoverflow.com/a/46475726/140927
    app.enable("trust proxy")

    // app.use(
    //   // https://regex101.com/r/Jieut9/1
    //   /^(.*(?<!(check|\.(png|jpg|ico|json|xml|webmanifest|svg|woff|woff2|css))))$/,
    //   keycloak.protect()
    // )

    // todo does not accept reentering of credentials
    if (logout)
      app.use(logout, (_req, res, _next) => {
        doReturnError(res)
        res.end('You have successfully logged out')
      })

    let lastTry = 0

    routes.forEach((route) => {
      app.use(route, (req, res, next) => {
        const credentials = getCredentials(req)

        if (credentials && (credentials.user.length || credentials.password.length)) {

          // Credentials ok? Go for it!
          if (doCheckCredentials(credentials.user, credentials.password)) {
            (req as any).user = credentials.user
            next()
            return
          }

          log('Wrong credentials', credentials)

          // Prevent brute force
          if (waitSecondsBetweenAuthorization > 0) {
            let now = Date.now()
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
}
