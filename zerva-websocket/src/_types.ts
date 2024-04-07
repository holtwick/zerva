import type { Channel, UseDispose } from 'zeed'

export const websocketName = 'zerva-websocket'
export const webSocketPath = `/${websocketName}`

// https://developer.mozilla.org/de/docs/Web/API/WebSockets_API/Writing_WebSocket_servers#pings_and_pongs_the_heartbeat_of_websockets
export const pingMessage = new Uint8Array([0x9])
export const pongMessage = new Uint8Array([0xA])

export const wsReadyStateConnecting = 0
export const wsReadyStateOpen = 1
export const wsReadyStateClosing = 2
export const wsReadyStateClosed = 3

/** Tell multiple channels apart  */
export type WebsocketChannel = Channel<Uint8Array> & {
  name: string
  path: string
}

declare global {
  interface ZContextEvents {
    webSocketConnect: (info: {
      channel: WebsocketChannel
      name?: string
      path?: string
      dispose: UseDispose
    }) => void
    webSocketDisconnect: (info: {
      channel: WebsocketChannel
      name?: string
      path?: string
      error?: Error
    }) => void
  }
}
