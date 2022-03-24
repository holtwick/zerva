// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.

import { on, register } from "@zerva/core"
import { Logger } from "zeed"
import {
  setTrackCollectUrl,
  setTrackWebsiteId,
  trackEvent,
  trackPageView,
} from "./track-plausible"

const name = "uammi"
const log = Logger(`zerva:${name}`)

interface Config {
  apiEventUrl: string
  websiteId: string
}

export function usePlausible(config: Config) {
  log.info(`use ${name}`)
  register(name)

  setTrackCollectUrl(config.apiEventUrl)
  setTrackWebsiteId(config.websiteId)

  on("trackEvent", trackEvent)
  on("trackPageView", trackPageView)
}
