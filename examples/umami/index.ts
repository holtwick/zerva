// Simple demo for node and CommonJS loading

import { emit, on, serve } from "@zerva/core"
import { useHttp } from "@zerva/http"
import { useUmami } from "@zerva/umami"
import { Logger, setupEnv, suid, valueToInteger } from "zeed"

setupEnv()

const log = Logger("app")

useHttp({
  port: valueToInteger(process.env.PORT, 8080),
})

useUmami({
  collectUrl: process.env.UMAMI_COLLECT_URL!,
  websiteId: process.env.UMAMI_WEBSITE_ID!,
})

on("httpInit", ({ get }) => {
  get(
    "/",
    `<a href="/trackEvent">trackEvent</a><br><a href="/trackPageView">trackPageView</a>`
  )

  const event = suid()

  get("/trackEvent", ({ req }) => {
    emit("trackEvent", req, "sample", event)
    return event
  })

  get("/trackPageView", ({ req }) => {
    emit("trackPageView", req, "/" + event)
    return event
  })
})

serve()
