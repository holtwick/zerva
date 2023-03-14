// Simple demo for node and CommonJS loading

import { on, serve } from "@zerva/core"
import { useHttp } from "@zerva/http"
import { useBasicAuth } from "@zerva/basic-auth"
import { Logger, LoggerInterface } from "zeed"

const log: LoggerInterface = Logger("basic-auth")

log('start')

useHttp()

useBasicAuth({
  logout: '/logout',
  routes: ["/protected"],
  users: {
    a: 'b'
  },
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
    log('protected',  req)
    return `<p>
        This should be protected:
      </p>
        User: ${req.user}
      <p>
        <a href="/logout">Logout</a>
      </p>`
  })
})

serve()
