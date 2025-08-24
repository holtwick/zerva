import type { Request } from './types'

export const isRequestProxied = (req: Request) => {
  const h = req.headers
  return !!(h['x-forwarded-for'] || h['x-forwarded-proto'] || h['x-forwarded-host'] ||
    h['x-forwarded-port'] || h['via'] || h['cf-connecting-ip'] || h['cf-ray'])
}
