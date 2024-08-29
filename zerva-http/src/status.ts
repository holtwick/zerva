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

export const status402PaymentRequired = (error?: string, payload: StatusPayload = {}) => statusError(402, error ?? 'Payment required', payload)

/// The request requires user authentication. The response must include a WWW-Authenticate header field containing a challenge applicable to the requested resource.
export const status401Unauthorized = (error?: string, payload: StatusPayload = {}) => statusError(401, error ?? 'Unauthorized', payload)

/// The client does not have access rights to the content; that is, it is unauthorized, so the server is refusing to give the requested resource. Unlike 401, the client's identity is known to the server.
export const status403Forbidden = (error?: string, payload: StatusPayload = {}) => statusError(403, error ?? 'Forbidden', payload)

/// The server has not found anything matching the Request-URI. No indication is given of whether the condition is temporary or permanent. The 410 (Gone) status code SHOULD be used if the server knows, through some internally configurable mechanism, that an old resource is permanently unavailable and has no forwarding address.
export const status404NotFound = (error?: string, payload: StatusPayload = {}) => statusError(404, error ?? 'Not found', payload)

export const status405MethodNotAllowed = (error?: string, payload: StatusPayload = {}) => statusError(405, error ?? 'Method not allowed', payload)
export const status406NotAcceptable = (error?: string, payload: StatusPayload = {}) => statusError(406, error ?? 'Not acceptable', payload)
export const status407ProxyAuthenticationRequired = (error?: string, payload: StatusPayload = {}) => statusError(407, error ?? 'Proxy authentication required', payload)
export const status408RequestTimeout = (error?: string, payload: StatusPayload = {}) => statusError(408, error ?? 'Request timeout', payload)
export const status409Conflict = (error?: string, payload: StatusPayload = {}) => statusError(409, error ?? 'Conflict', payload)
export const status410Gone = (error?: string, payload: StatusPayload = {}) => statusError(410, error ?? 'Gone', payload)
export const status411LengthRequired = (error?: string, payload: StatusPayload = {}) => statusError(411, error ?? 'Length required', payload)
export const status412PreconditionFailed = (error?: string, payload: StatusPayload = {}) => statusError(412, error ?? 'Precondition failed', payload)
export const status413PayloadTooLarge = (error?: string, payload: StatusPayload = {}) => statusError(413, error ?? 'Payload too large', payload)
export const status414URITooLong = (error?: string, payload: StatusPayload = {}) => statusError(414, error ?? 'URI too long', payload)
export const status415UnsupportedMediaType = (error?: string, payload: StatusPayload = {}) => statusError(415, error ?? 'Unsupported media type', payload)
export const status416RangeNotSatisfiable = (error?: string, payload: StatusPayload = {}) => statusError(416, error ?? 'Range not satisfiable', payload)
export const status417ExpectationFailed = (error?: string, payload: StatusPayload = {}) => statusError(417, error ?? 'Expectation failed', payload)
export const status418ImATeapot = (error?: string, payload: StatusPayload = {}) => statusError(418, error ?? 'I\'m a teapot', payload)
export const status421MisdirectedRequest = (error?: string, payload: StatusPayload = {}) => statusError(421, error ?? 'Misdirected request', payload)
export const status422UnprocessableEntity = (error?: string, payload: StatusPayload = {}) => statusError(422, error ?? 'Unprocessable entity', payload)
export const status423Locked = (error?: string, payload: StatusPayload = {}) => statusError(423, error ?? 'Locked', payload)
export const status424FailedDependency = (error?: string, payload: StatusPayload = {}) => statusError(424, error ?? 'Failed dependency', payload)
export const status425TooEarly = (error?: string, payload: StatusPayload = {}) => statusError(425, error ?? 'Too early', payload)
export const status426UpgradeRequired = (error?: string, payload: StatusPayload = {}) => statusError(426, error ?? 'Upgrade required', payload)
export const status428PreconditionRequired = (error?: string, payload: StatusPayload = {}) => statusError(428, error ?? 'Precondition required', payload)
export const status429TooManyRequests = (error?: string, payload: StatusPayload = {}) => statusError(429, error ?? 'Too many requests', payload)
export const status431RequestHeaderFieldsTooLarge = (error?: string, payload: StatusPayload = {}) => statusError(431, error ?? 'Request header fields too large', payload)
export const status451UnavailableForLegalReasons = (error?: string, payload: StatusPayload = {}) => statusError(451, error ?? 'Unavailable for legal reasons', payload)

export const status500InternalServerError = (error?: string, payload: StatusPayload = {}) => statusError(500, error ?? 'Internal server error', payload)
export const status501NotImplemented = (error?: string, payload: StatusPayload = {}) => statusError(501, error ?? 'Not implemented', payload)
export const status502BadGateway = (error?: string, payload: StatusPayload = {}) => statusError(502, error ?? 'Bad gateway', payload)
export const status503ServiceUnavailable = (error?: string, payload: StatusPayload = {}) => statusError(503, error ?? 'Service unavailable', payload)
export const status504GatewayTimeout = (error?: string, payload: StatusPayload = {}) => statusError(504, error ?? 'Gateway timeout', payload)
export const status505HTTPVersionNotSupported = (error?: string, payload: StatusPayload = {}) => statusError(505, error ?? 'HTTP version not supported', payload)
export const status506VariantAlsoNegotiates = (error?: string, payload: StatusPayload = {}) => statusError(506, error ?? 'Variant also negotiates', payload)
export const status507InsufficientStorage = (error?: string, payload: StatusPayload = {}) => statusError(507, error ?? 'Insufficient storage', payload)
export const status508LoopDetected = (error?: string, payload: StatusPayload = {}) => statusError(508, error ?? 'Loop detected', payload)
export const status510NotExtended = (error?: string, payload: StatusPayload = {}) => statusError(510, error ?? 'Not extended', payload)
export const status511NetworkAuthenticationRequired = (error?: string, payload: StatusPayload = {}) => statusError(511, error ?? 'Network authentication required', payload)
