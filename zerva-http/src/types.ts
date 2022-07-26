// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.

import type { Express, Request, Response } from "express"
import type { Server } from "http"

export type { Response, Request, Express }

export type httpHandlerModes = "get" | "post" | "put" | "delete"

export type httpPaths = string | RegExp | Array<string | RegExp>

export type httpResultPrimaryTypes = string | number | undefined | null | object

export type httpGetHandler =
  | httpResultPrimaryTypes
  | ((info: {
      res: Response
      req: Request
    }) => Promise<httpResultPrimaryTypes> | httpResultPrimaryTypes)

export type httpInterface = {
  app: Express
  http: Server
  get: (path: httpPaths, handler: httpGetHandler) => void
  post: (path: httpPaths, handler: httpGetHandler) => void
  put: (path: httpPaths, handler: httpGetHandler) => void
  delete: (path: httpPaths, handler: httpGetHandler) => void
  /** @deprecated */
  addStatic: (path: httpPaths, fsPath: string) => void
  static: (path: httpPaths, fsPath: string) => void
}

export interface httpConfig {
  host?: string
  port?: number
  sslCrt?: string
  sslKey?: string
  showServerInfo?: boolean
}

declare global {
  interface ZContextEvents {
    httpInit(info: httpInterface): void
    httpWillStart(info: httpInterface): void
    httpRunning(info: {
      http: Server
      port: number
      family: string
      address: string
    }): void
    httpStop(): void
  }
}
