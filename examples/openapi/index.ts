// Simple demo for node and CommonJS loading

import { useHttp } from "@zerva/http"
import { useOpenApi } from "@zerva/openapi"
import { on } from "@zerva/core"
import data from "./openapi.yaml"

useHttp()

on("httpInit", ({ get }) => {
  get("/", `<p>Goto <a href="/api/">API Documentation</a>`)
  get("/version", { version: "1.0" })
})

useOpenApi({
  path: "/api",
  data,
})
