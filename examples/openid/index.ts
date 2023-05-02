// Simple demo for node and CommonJS loading

import { on, serve } from "@zerva/core"
import { useHttp } from "@zerva/http"
import { useOpenID } from "@zerva/openid"
import { Logger, LoggerInterface } from "zeed"

const log: LoggerInterface = Logger("basic-auth")

log('start')

useHttp()

useOpenID({
  routes: ["/protected"],
  issuerBaseUrl: process.env['OAUTH2_URL'] ?? '', // todo  
  baseUrl: process.env['OAUTH2_CALLBACK_URL'] ?? 'http://localhost:8080',
  clientId: process.env['OAUTH2_CLIENT_ID'] ?? '', // todo,
  clientSecret: process.env['OAUTH2_CLIENT_SECRET'] ?? '' // todo
})

on("httpInit", ({ get }) => {
  get(
    "/",
    `<p>
      Not protected.
    </p>
    <p>
      <a href="/protected">But this one is with test:test</a>.
    </p>`
  )

  get("/protected", ({ req }) => {
    return `<p>
        This should be protected:
      </p>
        User: ${(req as any).user}
      <p>
        <a href="/logout">Logout</a>
      </p>`
  })
})

serve()
