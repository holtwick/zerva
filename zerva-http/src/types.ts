import type { Express, NextFunction, Request, RequestHandler, Response } from 'express'
import type { Server } from 'node:http'

export type { Server }
export type { Express, NextFunction, Request, RequestHandler, Response }

export type zervaHttpHandlerMetohod = 'get' | 'post' | 'put' | 'delete'

export type zervaHttpPaths = (string | RegExp)[] | (string | RegExp)

export type zervaHttpResultPrimaryTypes
  = | string
    | number
    | undefined
    | null
    | object
    | void

export type zervaHttpGetHandler
  = | zervaHttpResultPrimaryTypes
    | ((info: (Request & {
      res: Response
      req: Request
    }), res: Response, next: NextFunction) => Promise<zervaHttpResultPrimaryTypes> | zervaHttpResultPrimaryTypes)

export interface ZervaHttpRouteDescription {
  path: string
  method: string
  description: string
}

export interface ZervaHandlerReturn {
  description: (description: string) => void
}

export interface zervaHttpInterface {
  /** Express app */
  app: Express

  /** Node http */
  http: Server

  /** Reflects the registeres routes */
  routes: ZervaHttpRouteDescription[]

  /** GET */
  get: (this: void, path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]) => ZervaHandlerReturn

  /** POST */
  post: (this: void, path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]) => ZervaHandlerReturn

  /** PUT */
  put: (this: void, path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]) => ZervaHandlerReturn

  /** DELETE */
  delete: (this: void, path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]) => ZervaHandlerReturn

  /** GET */
  onGET: (this: void, path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]) => ZervaHandlerReturn

  /** POST */
  onPOST: (this: void, path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]) => ZervaHandlerReturn

  /** PUT */
  onPUT: (this: void, path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]) => ZervaHandlerReturn

  /** DELETE */
  onDELETE: (this: void, path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]) => ZervaHandlerReturn

  /** GET */
  GET: (this: void, path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]) => ZervaHandlerReturn

  /** POST */
  POST: (this: void, path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]) => ZervaHandlerReturn

  /** PUT */
  PUT: (this: void, path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]) => ZervaHandlerReturn

  /** DELETE */
  DELETE: (this: void, path: zervaHttpPaths, ...handlers: zervaHttpGetHandler[]) => ZervaHandlerReturn

  /** @deprecated use STATIC */
  addStatic: (this: void, path: zervaHttpPaths, fsPath: string) => void

  /** @deprecated use STATIC */
  static: (this: void, path: zervaHttpPaths, fsPath: string) => void

  /** Serve stativ file or folder  */
  STATIC: (this: void, path: zervaHttpPaths, fsPath: string) => void
}

declare global {
  interface ZContextEvents {
    httpInit: (info: zervaHttpInterface) => void
    httpWillStart: (info: zervaHttpInterface) => void
    httpRunning: (info: {
      http: Server
      port: number
      family: string
      address: string
    }) => void
    httpStop: () => void
    httpDidStop: () => void
  }
}
