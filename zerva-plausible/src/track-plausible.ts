import { fetch } from "cross-fetch"
import { getClientIp } from "request-ip"
import { fetchOptionsJson, fetchText, Logger } from "zeed"

const log = Logger("track")

let plausibleApiEventUrl: string
let plausibleWebsiteId: string

export function setTrackWebsiteId(id: string) {
  plausibleWebsiteId = id
  log.info("Plausible website ID:", plausibleWebsiteId)
}

export function setTrackCollectUrl(url: string) {
  plausibleApiEventUrl = url
  log.info("Plausible collect URL:", plausibleApiEventUrl)
}

type TrackEvent = {
  req: any
  name?: string
  props?: Record<string, string>
  url?: string
  domain?: string
}

export async function track(opt: TrackEvent) {
  setTimeout(async () => {
    try {
      let {
        name = "pageview",
        req,
        url,
        domain = plausibleWebsiteId,
        props,
      } = opt

      if (!url) url = req.originalUrl

      const language = req.get("accept-language")
      const ua = req.get("user-agent")
      const referrer = req.get("referrer")
      const ip = getClientIp(req)
      const hostname = req.hostname

      let body: any = {
        domain,
        name,
        url: `https://${domain}${url}`,
        referrer,
        hostname,
        language,
      }

      if (props) {
        body.props = JSON.stringify(props)
      }

      let options = {
        ...fetchOptionsJson(body, "POST"),
      }

      Object.assign(options.headers, {
        "Accept-Language": language,
        "User-Agent": ua,
        Referer: referrer,
        "cf-connecting-ip": ip,
        "X-Forwarded-For": ip,
        forwarded: `for=${ip}`,
      })

      // log.info(`track ${name} to ${plausibleApiEventUrl}:`, options)

      let response = await fetchText(plausibleApiEventUrl, options, fetch)

      if (response !== "ok") {
        log.info("unexpected plausible feedback:", response)
      }
    } catch (err) {
      log.warn("Failed to track", err)
    }
  }, 0)
}

export async function trackEvent(
  req: any,
  name: string,
  props?: Record<string, string>,
  url?: string
) {
  log.info(`event ${name}=${props}`)
  await track({
    name,
    props,
    url,
    req,
  })
}

export async function trackPageView(req: any, url?: string) {
  log.info(`pageview ${url}`)
  await track({
    name: "pageview",
    url,
    req,
  })
}
