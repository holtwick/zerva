// Simple demo for node and CommonJS loading

import { on, serve } from "@zerva/core"
import { useHttp } from "@zerva/http"
import { useKeycloak } from "@zerva/keycloak"

useHttp()

// useKeycloak({
//   routes: ["/protected"],
// })

on("httpInit", ({ get }) => {
  get("/", `<div>Not protected. But <a href="/protected">this one is</a>.`)
  get("/protected", `This should be protected`)
})

serve()
