import { on, register } from "@zerva/core"
import { Logger } from "zeed"
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
  // host?: string
  // protocol?: string
  // logout?: string
  // sessionSecret?: string
  // sessionStore?: session.Store
}

export function useBasicAuth(config?: ZervaKeycloakConfig) {
  log.info(`use ${name}`)
  register(name, ["http"])

  const {
    routes = [],
    users = {}
    // host,
    // protocol,
    // logout = "/logout",
    // sessionSecret = uuid(),
  } = config ?? {}

  function check(user:string, password:string) {
    return users[user] === password
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


    routes.forEach((route) => {
      log.info("protect", route)
      app.use(route, (req, res, next) => {
        var credentials = auth(req)

        // Check credentials
        // The "check" function will typically be against your user store
        if (!credentials || !check(credentials.user, credentials.password)) {
          res.statusCode = 401
          res.setHeader('WWW-Authenticate', 'Basic realm="example"')
          res.end('Access denied')
        } else {
          res.end('Access granted')
        }
      })
    })

    // emit("keycloakInit", {
    //   keycloak,
    //   app,
    // })
  })
}
