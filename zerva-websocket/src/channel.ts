import { Channel, Logger } from "zeed"
import { getWebsocketUrlFromLocation } from "./types"

const log = Logger("channel")

export class WebsocketChannel extends Channel {
  private ws: WebSocket

  isConnected = true

  constructor(ws: WebSocket) {
    super()
    this.ws = ws
    this.ws.addEventListener("message", (ev: MessageEvent) => {
      this.emit("message", ev)
    })
  }

  postMessage(data: any): void {
    this.ws.send(data)
  }

  close() {
    this.ws.close()
  }
}

export async function openWebSocketChannel(
  url?: string
): Promise<WebsocketChannel> {
  return new Promise((resolve) => {
    const socket = new WebSocket(url ?? getWebsocketUrlFromLocation())
    socket.binaryType = "arraybuffer"
    const channel = new WebsocketChannel(socket)
    socket.addEventListener("open", (event) => {
      resolve(channel)
    })
  })
}
