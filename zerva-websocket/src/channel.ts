import { Channel, Logger, useDispose } from "zeed"
import { getWebsocketUrlFromLocation } from "./types"

const log = Logger("channel")

export class WebsocketChannel extends Channel {
  private ws: WebSocket

  isConnected = true

  private _dispose = useDispose()

  private _emitMessage = (ev: MessageEvent) => {
    this.emit("message", ev)
  }

  constructor(ws: WebSocket) {
    super()
    this.ws = ws
    this.ws.addEventListener("message", this._emitMessage)
    this._dispose.add(() => {
      this.ws?.removeEventListener("message", this._emitMessage)
      this.ws?.close()
    })
  }

  postMessage(data: any): void {
    this.ws.send(data)
  }

  dispose() {
    this._dispose()
  }

  close() {
    this.dispose()
  }
}

export async function openWebSocketChannel(
  url?: string
): Promise<WebsocketChannel> {
  return new Promise((resolve) => {
    const socket = new WebSocket(url ?? getWebsocketUrlFromLocation())
    socket.binaryType = "arraybuffer"
    const channel = new WebsocketChannel(socket)

    const onOpen = (event: Event) => {
      log("ONOPEN")
      resolve(channel)
      socket.removeEventListener("open", onOpen)
    }

    socket.addEventListener("open", onOpen)
  })
}
