import { getClientIp } from 'request-ip'
import { Logger, fetchOptionsJson, fetchText } from 'zeed'
import { fetch } from 'cross-fetch'

const log = Logger('track')

let umamiCollectUrl: string
let umamiWebsiteId: string

export function setTrackWebsiteId(id: string) {
  umamiWebsiteId = id
  log.info('Umami website ID:', umamiWebsiteId)
}

export function setTrackCollectUrl(url: string) {
  umamiCollectUrl = url
  log.info('Umami collect URL:', umamiCollectUrl)
}

interface TrackEvent {
  type: 'event'
  req: any
  url?: string
  event_type?: string
  event_value?: string
  website?: string
}

interface TrackPageview {
  type: 'pageview'
  req: any
  url?: string
  website?: string
}

export async function track(opt: TrackEvent | TrackPageview) {
  setTimeout(async () => {
    try {
      let { type, req, url, website } = opt

      if (!url)
        url = req.originalUrl
      if (!website)
        website = umamiWebsiteId

      const language = req.get('accept-language')
      const ua = req.get('user-agent')
      const referrer = req.get('referrer')
      const ip = getClientIp(req)
      const hostname = req.hostname

      const body = {
        type,
        payload: {
          url,
          hostname,
          language,
          referrer,
          website,
        },
      }

      // log.info("track", { body, ua, referrer, ip })

      if (type === 'event') {
        const { event_type, event_value } = opt as TrackEvent
        Object.assign(body.payload, { event_type, event_value })
      }

      const options = {
        headers: {},
        ...fetchOptionsJson(body),
      }

      Object.assign(options.headers, {
        'Accept-Language': language,
        'User-Agent': ua,
        'Referer': referrer,
        'cf-connecting-ip': ip,
      })

      // log.info(`track ${type} to ${umamiTrackUrl}:`, options)

      const response = await fetchText(umamiCollectUrl, options, fetch)
      // log.info("tracked", response)
    }
    catch (err) {
      log.warn('Failed to track', err)
    }
  }, 0)
}

export async function trackEvent(
  req: any,
  event_type: string,
  event_value: any,
  url?: string,
) {
  log.info(`event ${event_type}=${event_value}`)
  await track({
    type: 'event',
    event_type,
    event_value,
    url,
    req,
  })
}

export async function trackPageView(req: any, url?: string) {
  log.info(`pageview ${url}`)
  await track({
    type: 'pageview',
    url,
    req,
  })
}
