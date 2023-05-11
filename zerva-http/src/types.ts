// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.

import type { Express, Request, RequestHandler, Response } from 'express-serve-static-core'
import { Server } from "http"

export type { Response, Request, Express, Server }

export type httpHandlerModes = "get" | "post" | "put" | "delete"

export type httpPaths = (string | RegExp)[] | (string | RegExp)

export type httpResultPrimaryTypes =
  | string
  | number
  | undefined
  | null
  | object
  | void

export type httpGetHandler =
  | httpResultPrimaryTypes
  | RequestHandler
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
  get: (path: httpPaths, ...handlers: httpGetHandler[]) => void

  /** POST */
  post: (path: httpPaths, ...handlers: httpGetHandler[]) => void

  /** PUT */
  put: (path: httpPaths, ...handlers: httpGetHandler[]) => void

  /** DELETE */
  delete: (path: httpPaths, ...handlers: httpGetHandler[]) => void

  /** GET */
  GET: (path: httpPaths, ...handlers: httpGetHandler[]) => void

  /** POST */
  POST: (path: httpPaths, ...handlers: httpGetHandler[]) => void

  /** PUT */
  PUT: (path: httpPaths, ...handlers: httpGetHandler[]) => void

  /** DELETE */
  DELETE: (path: httpPaths, ...handlers: httpGetHandler[]) => void

  /** @deprecated */
  addStatic: (path: httpPaths, fsPath: string) => void

  /** @deprecated */
  static: (path: httpPaths, fsPath: string) => void

  /** Serve stativ file or folder  */
  STATIC: (path: httpPaths, fsPath: string) => void
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
