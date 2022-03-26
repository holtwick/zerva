import { emit, on, register } from "@zerva/core"
import { Express } from "@zerva/http"
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
  logout?: string
  routes?: any[]
  sessionStore?: session.Store
}

export function useKeycloak(config?: ZervaKeycloakConfig) {
  log.info(`use ${name}`)
  register(name, ["http"])

  const { host, protocol, routes = [], logout = "/logout" } = config ?? {}

  const memoryStore = config?.sessionStore ?? new session.MemoryStore()

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
    logout,
    admin: "/",
  })

  // 1. Register middleware
  on("httpInit", ({ app }) => {
    app.use(sessionMiddleware)

    // Workaround for a bug
    app.use((req, res, next) => {
      // log("headers:", JSON.stringify(req.headers, null, 2))
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

    routes.forEach((route) => {
      log.info("protect", route)
      app.use(route, keycloak.protect())
    })

    emit("keycloakInit", {
      keycloak,
      app,
    })
  })
}
