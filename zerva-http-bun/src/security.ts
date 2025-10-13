import type { LoggerInterface } from 'zeed'
import type { ElysiaApp } from './types'

export interface SecurityOptions {
  helmet?: boolean
  csp?: boolean | string | 'strict' | 'moderate' | 'permissive' | 'disabled' | Record<string, any>
  securityHeaders?: boolean
  isSSL?: boolean
}

// CSP Presets
const CSP_PRESETS = {
  strict: {
    'default-src': ['\'self\''],
    'script-src': ['\'self\''],
    'style-src': ['\'self\'', '\'unsafe-inline\''],
    'img-src': ['\'self\'', 'data:', 'https:'],
    'font-src': ['\'self\'', 'https:', 'data:'],
    'connect-src': ['\'self\''],
    'media-src': ['\'self\''],
    'object-src': ['\'none\''],
    'frame-src': ['\'none\''],
    'base-uri': ['\'self\''],
    'form-action': ['\'self\''],
  },
  moderate: {
    'default-src': ['\'self\'', '\'unsafe-inline\''],
    'script-src': ['\'self\'', '\'unsafe-inline\'', '\'unsafe-eval\''],
    'style-src': ['\'self\'', '\'unsafe-inline\'', 'https:'],
    'img-src': ['\'self\'', 'data:', 'https:', 'http:'],
    'font-src': ['\'self\'', 'https:', 'data:'],
    'connect-src': ['\'self\'', 'https:', 'wss:', 'ws:'],
    'media-src': ['\'self\'', 'https:', 'data:'],
    'object-src': ['\'self\''],
    'frame-src': ['\'self\'', 'https:'],
  },
  permissive: {
    'default-src': ['\'self\'', '\'unsafe-inline\'', '\'unsafe-eval\'', 'data:', 'https:', 'http:'],
    'script-src': ['\'self\'', '\'unsafe-inline\'', '\'unsafe-eval\'', 'https:', 'http:'],
    'style-src': ['\'self\'', '\'unsafe-inline\'', 'https:', 'http:'],
    'img-src': ['*'],
    'font-src': ['*'],
    'connect-src': ['*'],
  },
}

function buildCSPHeader(cspConfig: any): string | null {
  if (cspConfig === false || cspConfig === 'disabled') {
    return null
  }

  let directives: Record<string, string[]>

  if (cspConfig === true) {
    directives = CSP_PRESETS.moderate
  }
  else if (typeof cspConfig === 'string' && cspConfig in CSP_PRESETS) {
    directives = CSP_PRESETS[cspConfig as keyof typeof CSP_PRESETS]
  }
  else if (typeof cspConfig === 'object') {
    directives = cspConfig
  }
  else {
    return null
  }

  return Object.entries(directives)
    .map(([key, values]) => `${key} ${Array.isArray(values) ? values.join(' ') : values}`)
    .join('; ')
}

export function setupSecurity(
  app: ElysiaApp,
  options: SecurityOptions,
  log: LoggerInterface,
): ElysiaApp {
  const { helmet, csp, securityHeaders, isSSL } = options

  // Basic security headers (Helmet-like)
  if (helmet) {
    log('Security headers (Helmet-style) enabled')

    app.onAfterHandle(({ set }) => {
      // X-DNS-Prefetch-Control
      set.headers['X-DNS-Prefetch-Control'] = 'off'

      // X-Frame-Options
      set.headers['X-Frame-Options'] = 'SAMEORIGIN'

      // X-Content-Type-Options
      set.headers['X-Content-Type-Options'] = 'nosniff'

      // X-XSS-Protection (legacy but still useful)
      set.headers['X-XSS-Protection'] = '1; mode=block'

      // Referrer-Policy
      set.headers['Referrer-Policy'] = 'no-referrer'

      // Remove X-Powered-By
      delete set.headers['X-Powered-By']
    })
  }

  // Content Security Policy
  if (csp) {
    const cspHeader = buildCSPHeader(csp)
    if (cspHeader) {
      log('Content Security Policy enabled')
      app.onAfterHandle(({ set }) => {
        set.headers['Content-Security-Policy'] = cspHeader
      })
    }
  }

  // Enhanced security headers
  if (securityHeaders) {
    log('Enhanced security headers enabled')

    app.onAfterHandle(({ set }) => {
      // HSTS (only if SSL is enabled)
      if (isSSL) {
        set.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
      }

      // Cross-Origin policies
      set.headers['Cross-Origin-Embedder-Policy'] = 'require-corp'
      set.headers['Cross-Origin-Opener-Policy'] = 'same-origin'
      set.headers['Cross-Origin-Resource-Policy'] = 'same-origin'

      // Permissions-Policy (formerly Feature-Policy)
      set.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
    })
  }

  return app
}
