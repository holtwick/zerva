// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { Logger, promisify, tryTimeout } from "zeed"
import { Server, Socket } from "socket.io"
import { ZSocketEmitOptions } from "./types"

declare global {
  interface ZContextEvents {
    socketIOSetup(io: Server): void
    socketIOConnect(conn: ZSocketIOConnection): void
    socketIODisconnect(conn: ZSocketIOConnection, error?: string): void
  }
}

const logName = "ws-server"
const log = Logger(logName)

export class ZSocketIOConnection {
  id: string
  socket: Socket
  timeout: number
  verified: boolean = false
  log: any

  get shortId() {
    return String(this.socket?.id || "").substr(0, 6)
  }

  constructor(socket: any, timeout: number = -1) {
    this.socket = socket
    this.id = socket.id
    this.timeout = timeout
    this.log = Logger(`${this.shortId}:${logName}`)
  }

  /** Emits event and can return result. On timeout or other error `null` will be returned */
  async emit<U extends keyof ZSocketIOEvents>(
    event: U,
    ...args: Parameters<ZSocketIOEvents[U]>
  ): Promise<ReturnType<ZSocketIOEvents[U]> | null> {
    try {
      return (
        (await tryTimeout(
          new Promise((resolve) => {
            this.log(`emit(${event})`, args)
            this.socket.emit(event, args[0], resolve)
          }),
          this.timeout
        )) ?? null
      )
    } catch (err) {
      this.log.warn(`emit(${event})`, err)
    }
    return null
  }

  async emitWithOptions<U extends keyof ZSocketIOEvents>(
    event: U,
    options: ZSocketEmitOptions,
    ...args: Parameters<ZSocketIOEvents[U]>
  ): Promise<ReturnType<ZSocketIOEvents[U]> | null> {
    try {
      return (
        (await tryTimeout(
          new Promise((resolve) => {
            this.log(`emit(${event})`, args)
            this.socket.emit(event, args[0], resolve)
          }),
          options?.timeout || this.timeout
        )) ?? null
      )
    } catch (err) {
      this.log.warn(`emit(${event})`, err)
    }
    return null
  }

  /** Listen to event and provide result if requested */
  async on<U extends keyof ZSocketIOEvents>(
    event: U,
    listener: ZSocketIOEvents[U]
  ) {
    // @ts-ignore
    this.socket.on(event, async (data: any, callback: any) => {
      try {
        this.log(`on(${event})`)
        let result = await promisify(listener(data))
        this.log(`our response on(${event})`, result)
        if (callback) callback(result)
      } catch (err: any) {
        this.log.warn(`error for on(${event})`, err)
        if (callback) callback({ error: err.message })
      }
    })
  }

  onAny(fn: any) {
    this.socket.onAny((...args) => {
      this.log("onAny", ...args)
      fn(...args)
    })
  }

  onClose(fn: any) {
    this.socket.on("close", fn) // ???
    this.socket.on("disconnect", fn)
    this.socket.on("error", fn)
  }

  static async broadcast<U extends keyof ZSocketIOEvents>(
    connections: ZSocketIOConnection[],
    event: U,
    ...args: Parameters<ZSocketIOEvents[U]>
  ): Promise<void> {
    log(
      "broadcast to",
      connections.map((conn) => conn.id)
    )
    await Promise.all(connections.map((conn) => conn.emit(event, ...args)))
  }
}
