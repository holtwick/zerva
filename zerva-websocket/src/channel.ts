import { Channel, equalBinary, Logger, useDispose } from "zeed"
import { WebSocketConnection } from "./connection"
import { getWebsocketUrlFromLocation, pingMessage, pongMessage } from "./types"

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

/** @deprecated Use `new WebSocketConnection(url)` */
export async function openWebSocketChannel(
  url?: string
): Promise<WebSocketConnection> {
  return new Promise((resolve) => {

    const channel = new WebSocketConnection(url)
    resolve(channel)

    // const socket = new WebSocket(url ?? getWebsocketUrlFromLocation())
    // socket.binaryType = "arraybuffer"

    
    // const channel = new WebsocketChannel(socket)

    // const onOpen = (event: Event) => {
    //   log("ONOPEN")
    //   resolve(channel)
    //   socket.removeEventListener("open", onOpen)
    // }

    // socket.addEventListener("open", onOpen)
  })
}
