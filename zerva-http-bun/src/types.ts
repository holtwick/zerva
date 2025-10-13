import type { Elysia } from 'elysia'
import type { LoggerInterface } from 'zeed'

export type ElysiaApp = Elysia<any>

export interface HttpBunInterface {
  app: ElysiaApp
  url: string
  port: number
  host: string
  isSSL: boolean
}

export interface HttpInitEvent {
  app: ElysiaApp
  log: LoggerInterface
}

export interface HttpRunningEvent {
  app: ElysiaApp
  url: string
  port: number
  host: string
  isSSL: boolean
}

export interface HttpStopEvent {
  app: ElysiaApp
}

declare global {
  interface ZContextEvents {
    httpInit: (info: HttpInitEvent) => void
    httpRunning: (info: HttpRunningEvent) => void
    httpStop: (info: HttpStopEvent) => void
  }
}
