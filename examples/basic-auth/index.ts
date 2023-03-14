// Simple demo for node and CommonJS loading

import { on, serve } from "@zerva/core"
import { useHttp } from "@zerva/http"
import { useBasicAuth } from "@zerva/basic-auth"
import { Logger, LoggerInterface } from "zeed"

const log: LoggerInterface = Logger("basic-auth")

log('start')

useHttp()

useBasicAuth({
  waitSecondsBetweenAuthorization: 5,
  routes: ["/protected"],
  logout: '/logout',
  auth: { a: 'b' },
})

on("httpInit", ({ get }) => {
  get(
    "/",
    `<p>
      Not protected.
    </p>
    <p>
      <a href="/protected">But this one is</a>.
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
