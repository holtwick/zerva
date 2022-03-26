// Simple demo for node and CommonJS loading

import { on, serve } from "@zerva/core"
import { useHttp } from "@zerva/http"
import { useKeycloak } from "@zerva/keycloak"

useHttp()

useKeycloak({
  routes: ["/protected"],
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
    //@ts-ignore
    const content = req?.kauth?.grant?.access_token?.content
    const info =
      content != null
        ? {
            auth: true,
            username: content.preferred_username,
            email: content.email,
            name: content.name,
            // content,
            // keys: Object.keys(content),
            // roles: content.realm_access.roles,
            // roles: content.resource_access.contenthub.roles,
            // content,
          }
        : {
            auth: false,
          }
    return `<p>
        This should be protected:
      </p>
        <pre>${JSON.stringify(info, null, 2)}</pre>
      <p>
        <a href="/logout">Logout</a>
      </p>`
  })
})

serve()
