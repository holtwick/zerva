// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { Channel } from "zeed"

export {}

export const webSocketPath = "/zerva-websocket"

// https://developer.mozilla.org/de/docs/Web/API/WebSockets_API/Writing_WebSocket_servers#pings_and_pongs_the_heartbeat_of_websockets
export const pingMessage = new Uint8Array([0x9])
export const pongMessage = new Uint8Array([0xa])

export const wsReadyStateConnecting = 0
export const wsReadyStateOpen = 1
export const wsReadyStateClosing = 2 // eslint-disable-line
export const wsReadyStateClosed = 3 // eslint-disable-line

declare global {
  interface ZContextEvents {
    webSocketConnect(info: { channel: Channel }): void
    webSocketDisconnect(info: { error?: Error; channel: Channel }): void
  }
}

export const getWebsocketUrlFromLocation = (path: string = webSocketPath) =>
  `ws${location.protocol.substr(4)}//${location.host}${path}`

declare module "ws" {
  export interface WebSocket {
    isAlive?: boolean
  }
}
