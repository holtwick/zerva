import type { LoggerInterface } from 'zeed'
import { Logger } from 'zeed'

const log: LoggerInterface = Logger('status')

export type StatusPayload = Record<string, any>

export interface StatusBody {
  success: boolean
  error: string
  [key: string]: any
}

export type StatusReturnType = [number, StatusBody]

export function statusError(code: number, error: string, payload: StatusPayload = {}): StatusReturnType {
  const info: StatusBody = {
    ...payload,
    success: false,
    error,
  }
  log.warn(`Status ${code}: ${error}`, payload)
  return [code, info]
}

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Status

export const status200OK = (info: any) => [200, info]

/** The request succeeded, and a new resource was created as a result. This is typically the response sent after POST requests, or some PUT requests. */
export const status201Created = (info: any) => [201, info]

export const status400BadRequest = (error?: string, payload: StatusPayload = {}) => statusError(400, error ?? 'Bad request', payload)
export const status401Unauthorized = (error?: string, payload: StatusPayload = {}) => statusError(401, error ?? 'Unauthorized', payload)
export const status403Forbidden = (error?: string, payload: StatusPayload = {}) => statusError(403, error ?? 'Forbidden', payload)
export const status404NotFound = (error?: string, payload: StatusPayload = {}) => statusError(404, error ?? 'Not found', payload)

export const status500InternalServerError = (error?: string, payload: StatusPayload = {}) => statusError(500, error ?? 'Internal server error', payload)
export const status501NotImplemented = (error?: string, payload: StatusPayload = {}) => statusError(501, error ?? 'Not implemented', payload)
export const status503ServiceUnavailable = (error?: string, payload: StatusPayload = {}) => statusError(503, error ?? 'Service unavailable', payload)
