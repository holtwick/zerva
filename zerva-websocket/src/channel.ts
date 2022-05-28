import { Channel, Logger, useEventListener } from "zeed"
import { WebSocketConnection } from "./connection"

const log = Logger("channel")

export class WebsocketChannel extends Channel {
  private ws: WebSocket

  isConnected = true
 
  constructor(ws: WebSocket) {
    super()
    this.ws = ws
    this.dispose.add(useEventListener(this.ws, 'message', (ev: MessageEvent) => {   
      log('emit message', ev.data)
      this.emit("message", ev)
    }))

    this.dispose.add(useEventListener(this.ws, 'close', () => this.close()))
  }

  postMessage(data: any): void {
    this.ws.send(data)
  }

  close() {
    super.close()
    this.dispose()
    this.ws.close()
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
