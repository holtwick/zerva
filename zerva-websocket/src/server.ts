// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.

import { assertModules, emit, on, once, onInit, onStop, register } from "@zerva/core"
import "@zerva/http"
import { parse } from "url"
import WebSocket, { WebSocketServer } from "ws"
import { Channel, equalBinary, Logger, LogLevelAliasType, uname } from "zeed"
import { pingMessage, pongMessage, webSocketPath, wsReadyStateConnecting, wsReadyStateOpen, } from "./types"

const moduleName = "websocket"

interface ZWebSocketConfig {
  path?: string
  pingInterval?: number
  logLevel?: LogLevelAliasType
}

function safeLength(data: any): number {
  try {
    return data?.length ?? data?.byteLength ?? data?.count ?? -1
  } catch (err: any) { }
  return -1
}

function safeType(data: any): string {
  try {
    return (data as any)?.constructor?.name ?? typeof data ?? "unknown"
  } catch (err: any) { }
  return "unknown"
}

export class WebsocketNodeConnection extends Channel {
  private ws: WebSocket
  private heartbeatInterval: any

  // Heartbeat state
  private isAlive: boolean = true

  // After close this will be false
  public isConnected: boolean = true

  constructor(ws: WebSocket, config: ZWebSocketConfig = {}) {
    super()

    this.ws = ws
    this.ws.binaryType = "arraybuffer"

    const id = uname(moduleName)
    const log = Logger(`${id}:zerva-${moduleName}`, config.logLevel ?? false)
    log.info("new connection", id)

    const { pingInterval = 30000 } = config

    // Will ensure that we don't loose the connection due to inactivity
    if (pingInterval > 0) {
      log.info("Heartbeat interval", pingInterval)
      this.heartbeatInterval = setInterval(() => {
        if (this.isAlive === false) {
          log("heartbeat failed, now close", ws)
          this.close()
        }
        this.isAlive = false
        ws.ping()
      }, pingInterval)
    }

    ws.on("pong", () => {
      this.isAlive = true
    })

    ws.on("message", (data: ArrayBuffer, isBinary: boolean) => {
      try {
        log(`onmessage length=${safeLength(data)} type=${safeType(data)}`)

        // Hardcoded message type to allow ping from client side, sends pong
        // This is different to the hearbeat and isAlive from before!
        if (equalBinary(data, pingMessage)) {
          log("-> ping -> pong")
          this.postMessage(pongMessage)
        } else {
          this.emit("message", {
            data,
          })
        }
      } catch (error) {
        log.warn("message parsing issues", error, data)
      }
    })

    ws.on("error", (error) => {
      log.error("onerror", error)
      this.stopHeartBeat()
      ws.close()
      if (this.isConnected) {
        this.isConnected = false
        this.emit("close")
        emit("webSocketDisconnect", {
          channel: this as any,
          error,
        })
      }
    })

    ws.on("close", () => {
      log.info("onclose")
      this.stopHeartBeat()
      if (this.isConnected) {
        this.isConnected = false
        this.emit("close")
        emit("webSocketDisconnect", {
          channel: this as any,
        })
      }
    })

    emit("webSocketConnect", {
      channel: this as any,
    })
  }

  postMessage(data: any): void {
    if (
      this.ws.readyState != null &&
      this.ws.readyState !== wsReadyStateConnecting &&
      this.ws.readyState !== wsReadyStateOpen
    ) {
      this.close()
    }
    try {
      this.ws.send(data)
    } catch (e) {
      this.close()
    }
  }

  stopHeartBeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = undefined
    }
  }

  close() {
    this.stopHeartBeat()
    this.ws.close()
  }
}

export function useWebSocket(config: ZWebSocketConfig = {}) {
  const log = Logger(moduleName, config.logLevel ?? false)

  log("setup")

  register(moduleName)

  onInit(() => {
    assertModules("http")
  })


  on("httpInit", ({ http }) => {
    let path = config.path ?? webSocketPath
    if (!path.startsWith("/")) path = `/${path}`

    log(`init path=${path}`)

    // https://github.com/websockets/ws
    // https://cheatcode.co/tutorials/how-to-set-up-a-websocket-server-with-node-js-and-express

    const wss = new WebSocketServer({
      noServer: true,
      path,
    })

    wss.on("connection", (ws, req: any) => {
      log.info("onconnection")
      ws.isAlive = true
      new WebsocketNodeConnection(ws, config)
    })

    once('serveStop', () => wss.close()) // todo does this have the expected effect?

    http.on("upgrade", (request: any, socket, head: Buffer) => {
      const { pathname } = parse(request.url)
      if (pathname === path) {
        log("onupgrade")
        wss.handleUpgrade(request, socket, head, (ws: any) => {
          log("upgrade connection")
          wss.emit("connection", ws, request)
        })
        // } else {
        //   log("ignore upgrade") // this can be vite HMR e.g.
        //   // socket.destroy()
      }
    })
  })
}
