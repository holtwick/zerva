// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.

import { Logger } from "zeed"
import { on, register } from "@zerva/core"
import {
  setTrackCollectUrl,
  setTrackWebsiteId,
  trackEvent,
  trackPageView,
} from "./track-umami"

const name = "uammi"
const log = Logger(`zerva:${name}`)

interface Config {
  collectUrl: string
  websiteId: string
}

export function useUmami(config: Config) {
  log.info(`use ${name}`)
  register(name)

  setTrackCollectUrl(config.collectUrl)
  setTrackWebsiteId(config.websiteId)

  on("trackEvent", trackEvent)
  on("trackPageView", trackPageView)
}
