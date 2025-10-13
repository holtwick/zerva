import type { LoggerInterface } from 'zeed'
import type { ElysiaApp } from './types'

export interface WebSocketConfig {
  enabled?: boolean
  compression?: boolean
  maxPayloadLength?: number
  idleTimeout?: number
}

export function setupWebSocket(
  app: ElysiaApp,
  config: WebSocketConfig,
  log: LoggerInterface,
): ElysiaApp {
  if (!config.enabled) {
    return app
  }

  log('WebSocket support enabled')

  // WebSocket is built into Elysia, we just need to ensure
  // users can add .ws() routes in their httpInit handlers
  // The actual WebSocket routes will be added by users via app.ws()

  return app
}

// Helper type for WebSocket handlers
export interface WebSocketHandler<T = any> {
  message?: (ws: any, message: T) => void | Promise<void>
  open?: (ws: any) => void | Promise<void>
  close?: (ws: any, code?: number, reason?: string) => void | Promise<void>
  error?: (ws: any, error: Error) => void | Promise<void>
  drain?: (ws: any) => void | Promise<void>
}
