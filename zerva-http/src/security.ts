import type { HelmetOptions } from 'helmet'
import type { Express } from './types'
import helmetDefault from 'helmet'

// CSP Presets and helper
function buildCSP(cspConfig: any) {
  if (cspConfig === false || cspConfig === 'disabled') {
    return false
  }

  if (cspConfig === true) {
    cspConfig = 'moderate'
  }

  // Preset configurations
  const presets = {
    strict: {
      defaultSrc: ['\'self\''],
      scriptSrc: ['\'self\''],
      styleSrc: ['\'self\'', '\'unsafe-inline\''], // unsafe-inline needed for many CSS frameworks
      imgSrc: ['\'self\'', 'data:', 'https:'],
      fontSrc: ['\'self\'', 'https:', 'data:'],
      connectSrc: ['\'self\''],
      mediaSrc: ['\'self\''],
      objectSrc: ['\'none\''],
      childSrc: ['\'self\''],
      workerSrc: ['\'self\''],
      frameSrc: ['\'none\''],
      upgradeInsecureRequests: [], // Helmet expects empty array for this directive
    },
    moderate: {
      defaultSrc: ['\'self\'', '\'unsafe-inline\''],
      scriptSrc: ['\'self\'', '\'unsafe-inline\'', '\'unsafe-eval\''], // eval needed for many frameworks
      styleSrc: ['\'self\'', '\'unsafe-inline\'', 'https:'],
      imgSrc: ['\'self\'', 'data:', 'https:', 'http:'],
      fontSrc: ['\'self\'', 'https:', 'data:'],
      connectSrc: ['\'self\'', 'https:', 'wss:', 'ws:'], // websockets support
      mediaSrc: ['\'self\'', 'https:', 'data:'],
      objectSrc: ['\'self\''],
      childSrc: ['\'self\'', 'https:'],
      workerSrc: ['\'self\'', 'blob:'],
      frameSrc: ['\'self\'', 'https:'],
      // upgradeInsecureRequests omitted (disabled) for moderate preset
    },
    permissive: {
      defaultSrc: ['\'self\'', '\'unsafe-inline\'', '\'unsafe-eval\'', 'data:', 'https:', 'http:'],
      scriptSrc: ['\'self\'', '\'unsafe-inline\'', '\'unsafe-eval\'', 'https:', 'http:'],
      styleSrc: ['\'self\'', '\'unsafe-inline\'', 'https:', 'http:'],
      imgSrc: '*',
      fontSrc: '*',
      connectSrc: '*',
      mediaSrc: '*',
      objectSrc: '*',
      childSrc: '*',
      workerSrc: '*',
      frameSrc: '*',
      // upgradeInsecureRequests omitted (disabled) for permissive preset
    },
  }

  if (typeof cspConfig === 'string') {
    if (cspConfig in presets) {
      return normalizeCSPDirectives(presets[cspConfig as keyof typeof presets])
    }
    // Custom CSP string - return as directives object
    const directives: any = {}
    cspConfig.split(';').forEach((directive: string) => {
      const [key, ...values] = directive.trim().split(/\s+/)
      if (key) {
        const camelKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
        directives[camelKey] = values
      }
    })
    return normalizeCSPDirectives(directives)
  }

  // Return object with proper normalization
  return normalizeCSPDirectives(cspConfig)
}

// Normalize CSP directives for helmet compatibility
function normalizeCSPDirectives(cspConfig: any) {
  if (!cspConfig || typeof cspConfig !== 'object') {
    return cspConfig
  }

  const normalized = { ...cspConfig }

  // Handle upgradeInsecureRequests: true -> [], false/undefined -> omit
  if (normalized.upgradeInsecureRequests === true) {
    normalized.upgradeInsecureRequests = []
  }
  else if (normalized.upgradeInsecureRequests === false || normalized.upgradeInsecureRequests === undefined) {
    delete normalized.upgradeInsecureRequests
  }

  return normalized
}

export interface SecurityConfig {
  helmet: boolean | HelmetOptions
  csp: boolean | string | object
  securityHeaders: boolean
  isSSL: boolean
}

export function setupSecurity(app: Express, config: SecurityConfig, log: any) {
  const { helmet, csp, securityHeaders, isSSL } = config

  // Helmet security headers with optional CSP
  if (helmet || csp !== false || securityHeaders) {
    // Auto-enable moderate CSP when securityHeaders is true and CSP is not explicitly set
    let effectiveCSP = csp
    if (securityHeaders && (csp === false || csp === true)) {
      effectiveCSP = csp === false ? 'moderate' : csp
    }

    const cspDirectives = buildCSP(effectiveCSP)
    const options = {
      contentSecurityPolicy: cspDirectives !== false ? { directives: cspDirectives } : false,
    }

    log('Helmet with CSP', {
      helmet: options,
      csp: cspDirectives !== false ? (effectiveCSP || 'moderate') : 'disabled',
      autoEnabled: securityHeaders && csp === false ? 'via securityHeaders' : false,
    })

    app.use(helmetDefault(options))
  }

  // Enhanced security headers beyond helmet
  if (securityHeaders) {
    log('Enhanced security headers enabled')
    app.use((req, res, next) => {
      // Strict-Transport-Security (HSTS) - force HTTPS for 1 year
      if (isSSL) {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
      }

      // Additional security headers
      res.setHeader('X-Content-Type-Options', 'nosniff')
      res.setHeader('X-Frame-Options', 'DENY')
      res.setHeader('X-XSS-Protection', '1; mode=block')
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
      res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=()')
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
      res.setHeader('Cross-Origin-Resource-Policy', 'same-origin')

      // Remove server identification
      res.removeHeader('X-Powered-By')
      res.removeHeader('Server')

      next()
    })
  }
}
