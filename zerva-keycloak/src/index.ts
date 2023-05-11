import { emit, on, register } from '@zerva/core'
import type { Express } from '@zerva/http'
import session from 'express-session'
import type { Keycloak } from 'keycloak-connect'
import KeycloakConnect from 'keycloak-connect'
import { Logger, uuid } from 'zeed'

const name = 'keycloak'
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
  sessionSecret?: string
  sessionStore?: session.Store
}

export function useKeycloak(config?: ZervaKeycloakConfig) {
  log.info(`use ${name}`)
  register(name, ['http'])

  const {
    host,
    protocol,
    routes = [],
    logout = '/logout',
    sessionSecret = uuid(),
  } = config ?? {}

  const memoryStore = config?.sessionStore ?? new session.MemoryStore()

  const keycloak = new KeycloakConnect({
    store: memoryStore,
  })

  const sessionMiddleware = session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  })

  const keycloakMiddleware = keycloak.middleware({
    logout,
    admin: '/',
  })

  // 1. Register middleware
  on('httpInit', ({ app }) => {
    // https://stackoverflow.com/a/46475726/140927
    app.enable('trust proxy')

    app.use(sessionMiddleware)

    // Workaround for proxies that don't set the right X-Proto headers
    app.use((req, res, next) => {
      // log("headers:", JSON.stringify(req.headers, null, 2))

      if (protocol) {
        Object.defineProperty(req, 'protocol', {
          configurable: true,
          enumerable: true,
          get: () => protocol,
        })
      }

      if (host)
        req.headers.host = host

      next()
    })

    app.use(keycloakMiddleware)

    // app.use(
    //   // https://regex101.com/r/Jieut9/1
    //   /^(.*(?<!(check|\.(png|jpg|ico|json|xml|webmanifest|svg|woff|woff2|css))))$/,
    //   keycloak.protect()
    // )

    routes.forEach((route) => {
      log.info('protect', route)
      app.use(route, keycloak.protect())
    })

    emit('keycloakInit', {
      keycloak,
      app,
    })
  })
}

export function keycloakGetRoles(req: Request, resource = 'master') {
  return (
    // @ts-expect-error
    req?.kauth?.grant?.access_token?.content?.resource_access?.[resource]
      ?.roles ?? []
  )
}

export function keycloakCheckRole(
  req: Request,
  role: string,
  resource = 'master',
) {
  return keycloakGetRoles(req, resource).includes(role)
}

export function keycloakGetUserName(req: Request, resource = 'master') {
  return (
    // @ts-expect-error
    req?.kauth?.grant?.access_token?.content?.preferred_username ?? ''
  )
}

export function keycloakGetEmail(req: Request, resource = 'master') {
  return (
    // @ts-expect-error
    req?.kauth?.grant?.access_token?.content?.email ?? ''
  )
}

export function keycloakGetName(req: Request, resource = 'master') {
  return (
    // @ts-expect-error
    req?.kauth?.grant?.access_token?.content?.name ?? ''
  )
}
