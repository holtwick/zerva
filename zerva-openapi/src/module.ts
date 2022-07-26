// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.

import { Logger } from "zeed"
import { on, register } from "@zerva/core"

const name = "openapi"
const log = Logger(`zerva:${name}`)

interface Config {
  collectUrl: string
  websiteId: string
}

export function useOpenApi(config: Config) {
  log.info(`use ${name}`)
  register(name)

  // on("trackEvent", trackEvent)
  // on("trackPageView", trackPageView)
}
