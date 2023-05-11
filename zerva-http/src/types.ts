// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.

import type { Server } from 'node:http'
import type { Express, Request, RequestHandler, Response } from 'express-serve-static-core'

export type { Response, Request, Express, Server, RequestHandler }

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
  | RequestHandler
  | ((info: {
    res: Response
    req: Request
  }) => Promise<zervaHttpResultPrimaryTypes> | zervaHttpResultPrimaryTypes)

export interface zervaHttpInterface {
  /** Express app */
  app: Express

  /** Node http */
  http: Server

  /** GET */
  get(path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]): void

  /** POST */
  post(path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]): void

  /** PUT */
  put(path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]): void

  /** DELETE */
  delete(path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]): void

  /** GET */
  GET(path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]): void

  /** POST */
  POST(path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]): void

  /** PUT */
  PUT(path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]): void

  /** DELETE */
  DELETE(path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]): void

  /** @deprecated use STATIC */
  addStatic(path: zervaHttpPaths, fsPath: string): void

  /** @deprecated use STATIC */
  static(path: zervaHttpPaths, fsPath: string): void

  /** Serve stativ file or folder  */
  STATIC(path: zervaHttpPaths, fsPath: string): void
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
  }
}
