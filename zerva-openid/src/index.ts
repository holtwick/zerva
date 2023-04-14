import { on, register } from "@zerva/core"
import '@zerva/http'
import { auth } from 'express-openid-connect'
import { Logger } from "zeed"

const name = "basic-auth"
const log = Logger(`zerva:${name}`)

interface ZervaOpenIDConfig {
  /** Routes to protect, by default all */
  routes?: any[]

  /** Base URL of the service */
  baseUrl: string

  /** URL of the service itself */
  issuerBaseUrl: string

  /** OpenID ID */
  clientId: string

  /** OpenID secret */
  clientSecret: string
}

export function useOpenID(config?: ZervaOpenIDConfig) {
  log.info(`use ${name}`)
  register(name, ["http"])

  const {
    routes = ['/'],
    baseUrl,
    issuerBaseUrl,
    clientId,
    clientSecret
  } = config ?? {}

  // 1. Register middleware
  on("httpInit", ({ app }) => {
    // https://stackoverflow.com/a/46475726/140927
    app.enable("trust proxy")

    // app.use(
    //   // https://regex101.com/r/Jieut9/1
    //   /^(.*(?<!(check|\.(png|jpg|ico|json|xml|webmanifest|svg|woff|woff2|css))))$/,
    //   keycloak.protect()
    // )

    let authMiddleware = auth({
      issuerBaseURL: issuerBaseUrl,
      baseURL: baseUrl,
      clientID: clientId,
      secret: clientSecret,
      idpLogout: true,
    })

    app.use(authMiddleware)
    // routes.forEach((route) => app.use(route, authMiddleware))
  })
}
