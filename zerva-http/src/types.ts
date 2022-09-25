// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.

import { Express, Request, Response } from "express"
import { Server } from "http"

export type { Response, Request, Express, Server }

export type httpHandlerModes = "get" | "post" | "put" | "delete"

export type httpPaths = string | RegExp | Array<string | RegExp>

export type httpResultPrimaryTypes =
  | string
  | number
  | undefined
  | null
  | object
  | void

export type httpGetHandler =
  | httpResultPrimaryTypes
  | ((info: {
      res: Response
      req: Request
    }) => Promise<httpResultPrimaryTypes> | httpResultPrimaryTypes)

export type httpInterface = {
  /** Express app */
  app: Express

  /** Node http */
  http: Server

  /** GET */
  get: (path: httpPaths, handler: httpGetHandler) => void

  /** POST */
  post: (path: httpPaths, handler: httpGetHandler) => void

  /** PUT */
  put: (path: httpPaths, handler: httpGetHandler) => void

  /** DELETE */
  delete: (path: httpPaths, handler: httpGetHandler) => void

  addStatic: (path: httpPaths, fsPath: string) => void

  /** @deprecated */
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
