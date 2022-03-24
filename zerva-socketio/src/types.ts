// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { Socket } from "socket.io-client"

export {}

export interface ZSocketEmitOptions {
  timeout?: number
}

declare global {
  interface ZSocketIOEvents {
    serverPing(data: any): any
    serverPong(data: any): any
    serverConfig(): any
  }
}
