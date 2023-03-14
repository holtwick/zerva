import { on, register } from "@zerva/core"
import { Logger, size } from "zeed"
import { auth } from "./auth"
import '@zerva/http'

const name = "basic-auth"
const log = Logger(`zerva:${name}`)

declare global {
  interface ZContextEvents {
    // basicAuth(info: { keycloak: Keycloak; app: Express }): void
  }
}

interface ZervaKeycloakConfig {
  routes?: any[]
  users?: Record<string, string>
  logout?: string
  realm?: string
}

export function useBasicAuth(config?: ZervaKeycloakConfig) {
  log.info(`use ${name}`)
  register(name, ["http"])

  const {
    routes = ['/'],
    users = {},
    logout,
    realm="default"
  } = config ?? {}

if (size(users) <= 0) log.error('No user credentials found!')

  function doCheckCredentials(user: string, password: string) {
    return users[user] === password
  }

  function doLogout(res: any) {
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
        doLogout(res)
        res.end('You have successfully logged out')
      })

    routes.forEach((route) => {
      log.info("protect", route)
      app.use(route, (req, res, next) => {
        var credentials = auth(req)

        // Check credentials
        // The "check" function will typically be against your user store
        if (!credentials || !doCheckCredentials(credentials.user, credentials.password)) {
          doLogout(res)
          res.end('Access denied')
          return
        }

        (req as any).user = credentials.user
        next()
      })
    })
  })
}
