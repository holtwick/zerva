import { io, ManagerOptions, Socket, SocketOptions } from "socket.io-client"
import { ZSocketEmitOptions } from "./types"
import { empty, Logger, LoggerInterface, promisify, tryTimeout } from "zeed"
import "./types"

const logName = "ws-client"
const log = Logger(logName)

export const getWebsocketUrlFromLocation = () =>
  "ws" + location.protocol.substr(4) + "//" + location.host

export class ZSocketIOConnection {
  private socket?: any // Socket
  private log: LoggerInterface = log

  constructor(socket: Socket) {
    this.socket = socket

    if (this.socket?.id) {
      this.log = Logger(`${this.shortId}:${logName}`)
    }

    // let didResolve = false
    this.socket?.on("connect", () => {
      this.log = Logger(`${this.shortId}:${logName}`)
      this.log(`on connect`)
    })

    this.socket?.on("error", (err: any) => {
      this.log(`on error:`, err)
      // conn.close()
    })

    this.socket?.on("disconnect", (err: any) => {
      this.log(`on disconnect:`, err)
    })

    // this.socket?.onAny((...args) => {
    //   log("onAny", ...args)
    // })

    // Hack to reconnect on iOS
    // https://stackoverflow.com/a/4910900/140927
    var now
    var lastFired = new Date().getTime()
    setInterval(() => {
      now = new Date().getTime()
      if (now - lastFired > 2000) {
        this.socket?.close()
        this.socket?.open()
      }
      lastFired = now
    }, 500)
  }

  get id(): string {
    let id = this.socket?.id
    if (empty(id)) {
      log.warn("Expected to find a socket ID")
    }
    return id || ""
  }

  get shortId() {
    return String(this.socket?.id || "").substr(0, 6)
  }

  emit<U extends keyof ZSocketIOEvents>(
    event: U,
    ...args: Parameters<ZSocketIOEvents[U]>
  ): Promise<ReturnType<ZSocketIOEvents[U]>> {
    return new Promise((resolve) => {
      this.log(`emit(${event})`, args)
      this.socket?.emit(event, args[0], (value: any) => {
        this.log(`response for emit(${event}) =`, value)
        resolve(value)
      })
    })
  }

  async emitWithOptions<U extends keyof ZSocketIOEvents>(
    event: U,
    options: ZSocketEmitOptions,
    ...args: Parameters<ZSocketIOEvents[U]>
  ): Promise<ReturnType<ZSocketIOEvents[U]> | undefined> {
    try {
      return await tryTimeout(
        new Promise((resolve) => {
          this.log(`emit(${event})`, args)
          this.socket?.emit(event, args[0], (value: any) => {
            this.log(`response for emit(${event}) =`, value)
            resolve(value)
          })
        }),
        options?.timeout || -1
      )
    } catch (err) {
      this.log.warn(`emit(${event})`, err)
    }
  }

  async on<U extends keyof ZSocketIOEvents>(
    event: U,
    listener: ZSocketIOEvents[U]
  ) {
    // @ts-ignore
    this.socket?.on(event, async (data: any, callback: any) => {
      try {
        this.log(`on(${event})`, data)
        let result = await promisify(listener(data))
        this.log(`our resonse on(${event})`, result)
        if (callback) callback(result)
      } catch (err: any) {
        this.log.warn(`warnung on(${event})`, err)
        if (callback) callback({ error: err.message })
      }
    })
  }

  onAny(fn: any) {
    this.socket?.onAny((...args: any[]) => {
      this.log("onAny", ...args)
      fn(...args)
    })
  }

  close() {
    this.socket?.close()
    this.socket = undefined
  }

  public static connect(
    host?: string,
    options?: ManagerOptions & SocketOptions
  ): ZSocketIOConnection | undefined {
    let wsHost = host ?? getWebsocketUrlFromLocation()
    log("start connecting to", wsHost)
    const socket = io(wsHost, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 3000,
      reconnectionAttempts: Infinity,
      autoConnect: true,
      ...options,
    } as any)
    if (socket) {
      return new ZSocketIOConnection(socket)
    }
  }

  // static async broadcast<U extends keyof ZSocketIOEvents>(
  //   connections: Connection[],
  //   event: U,
  //   ...args: Parameters<ZSocketIOEvents[U]>
  // ): Promise<void> {
  //   await Promise.all(connections.map((conn) => conn.emit(event, ...args)))
  // }
}
