// pid @types/express-session express-session keycloak-connect
import { emit, on, register } from "@zerva/core"
import { Express } from "@zerva/http"
import { IRouter } from "express"
import session from "express-session"
import KeycloakConnect, { Keycloak } from "keycloak-connect"
import { Logger } from "zeed"

const name = "keycloak"
const log = Logger(`zerva:${name}`)

declare global {
  interface ZContextEvents {
    keycloakInit(info: { keycloak: Keycloak; app: Express }): void
  }
}

interface ZervaKeycloakConfig {
  host?: string
  protocol?: string
  routes?: IRouter | IRouter[]
}

export function useKeycloak(config?: ZervaKeycloakConfig) {
  log.info(`use ${name}`)
  register(name, ["http"])

  const { host, protocol, routes } = config ?? {}

  const memoryStore = new session.MemoryStore()

  const keycloak = new KeycloakConnect({
    store: memoryStore,
  })

  const sessionMiddleware = session({
    secret: "keycloak-secret",
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  })

  const keycloakMiddleware = keycloak.middleware({
    logout: "/logout",
    admin: "/",
  })

  // 1. Register middleware
  on("httpInit", ({ app }) => {
    app.use(sessionMiddleware)

    // Workaround for a bug
    app.use((req, res, next) => {
      log.info("headers:", JSON.stringify(req.headers, null, 2))
      // let redirectUrl = protocol + '://' + host + (port === '' ? '' : ':' + port) + (req.originalUrl || req.url) + (hasQuery ? '&' : '?') + 'auth_callback=1';
      if (host) {
        req.headers["host"] = host
      }
      if (protocol) {
        req.protocol = protocol
      } else if (!host && req.hostname.startsWith("localhost")) {
        req.protocol = "http"
      }
      next()
    })

    app.use(keycloakMiddleware)

    // app.use(
    //   // https://regex101.com/r/Jieut9/1
    //   /^(.*(?<!(check|\.(png|jpg|ico|json|xml|webmanifest|svg|woff|woff2|css))))$/,
    //   keycloak.protect()
    // )

    emit("keycloakInit", { keycloak, app })

    if (routes) {
      let routesList = Array.isArray(routes) ? routes : [routes]
      app.use(keycloak.protect())
      routesList.forEach((route) => {
        app.use(route, keycloak.protect())
      })
    }

    // app.use(keycloak.protect())

    // app.get("/check", (req, res) => {
    //   // @ts-ignore
    //   let content = req?.kauth?.grant?.access_token?.content
    //   if (content != null) {
    //     // log.info(
    //     //   "called check",
    //     //   Object.keys(content),
    //     //   content.preferred_username,
    //     //   content.realm_access.roles
    //     // )
    //     res.json({
    //       auth: true,
    //       // content,
    //       keys: Object.keys(content),
    //       username: content.preferred_username,
    //       email: content.email,
    //       name: content.name,
    //       // roles: content.realm_access.roles,
    //       roles: content.resource_access.contenthub.roles,
    //       content,
    //     })
    //   } else {
    //     res.json({ auth: false })
    //   }
  })
}

// export function checkRole(req: Request, role: string, resource = "contenthub") {
//   // Has all roles if unprotected
//   if (!config.protect) return true

//   // content.realm_access.roles,
//   const roles =
//     // @ts-ignore
//     req?.kauth?.grant?.access_token?.content?.resource_access?.[resource]
//       ?.roles ?? []
//   // log.info(`check role ${role} against ${JSON.stringify(roles)}`, req?.kauth)
//   return roles.includes(role)
// }
