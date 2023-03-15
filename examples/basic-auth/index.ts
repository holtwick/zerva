// Simple demo for node and CommonJS loading

import { on, serve } from "@zerva/core"
import { useHttp } from "@zerva/http"
import { useBasicAuth, useHtpasswd } from "@zerva/basic-auth"
import { Logger, LoggerInterface } from "zeed"
import { readFileSync } from "fs"

const log: LoggerInterface = Logger("basic-auth")

log('start')

useHttp()

let {validate} = useHtpasswd(readFileSync('.htpasswd', 'utf8'))

useBasicAuth({
  waitSecondsBetweenAuthorization: 5,
  routes: ["/protected"],
  logout: '/logout',
  auth: validate // { a: 'b' },
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
