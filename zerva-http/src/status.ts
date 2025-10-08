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

// Helper function to create status error functions
function createStatusError(code: number, defaultMessage: string) {
  return (error?: string, payload: StatusPayload = {}) => statusError(code, error ?? defaultMessage, payload)
}

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Status

export const status200OK = (info: any) => [200, info] as const

/** The request succeeded, and a new resource was created as a result. This is typically the response sent after POST requests, or some PUT requests. */
export const status201Created = (info: any) => [201, info] as const

export const status400BadRequest = createStatusError(400, 'Bad request')
/// The request requires user authentication. The response must include a WWW-Authenticate header field containing a challenge applicable to the requested resource.
export const status401Unauthorized = createStatusError(401, 'Unauthorized')
export const status402PaymentRequired = createStatusError(402, 'Payment required')
/// The client does not have access rights to the content; that is, it is unauthorized, so the server is refusing to give the requested resource. Unlike 401, the client's identity is known to the server.
export const status403Forbidden = createStatusError(403, 'Forbidden')
/// The server has not found anything matching the Request-URI. No indication is given of whether the condition is temporary or permanent. The 410 (Gone) status code SHOULD be used if the server knows, through some internally configurable mechanism, that an old resource is permanently unavailable and has no forwarding address.
export const status404NotFound = createStatusError(404, 'Not found')
export const status405MethodNotAllowed = createStatusError(405, 'Method not allowed')
export const status406NotAcceptable = createStatusError(406, 'Not acceptable')
export const status407ProxyAuthenticationRequired = createStatusError(407, 'Proxy authentication required')
export const status408RequestTimeout = createStatusError(408, 'Request timeout')
export const status409Conflict = createStatusError(409, 'Conflict')
export const status410Gone = createStatusError(410, 'Gone')
export const status411LengthRequired = createStatusError(411, 'Length required')
export const status412PreconditionFailed = createStatusError(412, 'Precondition failed')
export const status413PayloadTooLarge = createStatusError(413, 'Payload too large')
export const status414URITooLong = createStatusError(414, 'URI too long')
export const status415UnsupportedMediaType = createStatusError(415, 'Unsupported media type')
export const status416RangeNotSatisfiable = createStatusError(416, 'Range not satisfiable')
export const status417ExpectationFailed = createStatusError(417, 'Expectation failed')
export const status418ImATeapot = createStatusError(418, 'I\'m a teapot')
export const status421MisdirectedRequest = createStatusError(421, 'Misdirected request')
export const status422UnprocessableEntity = createStatusError(422, 'Unprocessable entity')
export const status423Locked = createStatusError(423, 'Locked')
export const status424FailedDependency = createStatusError(424, 'Failed dependency')
export const status425TooEarly = createStatusError(425, 'Too early')
export const status426UpgradeRequired = createStatusError(426, 'Upgrade required')
export const status428PreconditionRequired = createStatusError(428, 'Precondition required')
export const status429TooManyRequests = createStatusError(429, 'Too many requests')
export const status431RequestHeaderFieldsTooLarge = createStatusError(431, 'Request header fields too large')
export const status451UnavailableForLegalReasons = createStatusError(451, 'Unavailable for legal reasons')

export const status500InternalServerError = createStatusError(500, 'Internal server error')
export const status501NotImplemented = createStatusError(501, 'Not implemented')
export const status502BadGateway = createStatusError(502, 'Bad gateway')
export const status503ServiceUnavailable = createStatusError(503, 'Service unavailable')
export const status504GatewayTimeout = createStatusError(504, 'Gateway timeout')
export const status505HTTPVersionNotSupported = createStatusError(505, 'HTTP version not supported')
export const status506VariantAlsoNegotiates = createStatusError(506, 'Variant also negotiates')
export const status507InsufficientStorage = createStatusError(507, 'Insufficient storage')
export const status508LoopDetected = createStatusError(508, 'Loop detected')
export const status510NotExtended = createStatusError(510, 'Not extended')
export const status511NetworkAuthenticationRequired = createStatusError(511, 'Network authentication required')
