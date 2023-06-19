// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.

import type { Server } from 'node:http'
import type { Express, NextFunction, Request, RequestHandler, Response } from 'express'

export type { Server }
export type { Express, NextFunction, Request, RequestHandler, Response }

export type zervaHttpHandlerModes = 'get' | 'post' | 'put' | 'delete'

export type zervaHttpPaths = (string | RegExp)[] | (string | RegExp)

export type zervaHttpResultPrimaryTypes =
  | string
  | number
  | undefined
  | null
  | object
  | void

export type zervaHttpGetHandler =
  | zervaHttpResultPrimaryTypes
  | ((info: (Request & {
    res: Response
    req: Request
  }), res: Response, next: NextFunction) => Promise<zervaHttpResultPrimaryTypes> | zervaHttpResultPrimaryTypes)

export interface zervaHttpInterface {
  /** Express app */
  app: Express

  /** Node http */
  http: Server

  /** GET */
  get(this: void, path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]): void

  /** POST */
  post(this: void, path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]): void

  /** PUT */
  put(this: void, path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]): void

  /** DELETE */
  delete(this: void, path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]): void

  /** GET */
  onGET(this: void, path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]): void

  /** POST */
  onPOST(this: void, path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]): void

  /** PUT */
  onPUT(this: void, path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]): void

  /** DELETE */
  onDELETE(this: void, path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]): void

  /** GET */
  GET(this: void, path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]): void

  /** POST */
  POST(this: void, path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]): void

  /** PUT */
  PUT(this: void, path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]): void

  /** DELETE */
  DELETE(this: void, path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]): void

  /** @deprecated use STATIC */
  addStatic(this: void, path: zervaHttpPaths, fsPath: string): void

  /** @deprecated use STATIC */
  static(this: void, path: zervaHttpPaths, fsPath: string): void

  /** Serve stativ file or folder  */
  STATIC(this: void, path: zervaHttpPaths, fsPath: string): void
}

declare global {
  interface ZContextEvents {
    httpInit(info: zervaHttpInterface): void
    httpWillStart(info: zervaHttpInterface): void
    httpRunning(info: {
      http: Server
      port: number
      family: string
      address: string
    }): void
    httpStop(): void
    httpDidStop(): void
  }
}
