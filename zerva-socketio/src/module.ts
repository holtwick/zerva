// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.

import { Logger } from "zeed"
import { on, emit, register, onInit, requireModules } from "@zerva/core"
import { Server, ServerOptions, Socket } from "socket.io"
import { ZSocketIOConnection } from "./connection-node"
import { detect } from "detect-browser"

const name = "zerva:socketio"
const log = Logger(name)

interface ZSocketIOConfig {
  debug?: boolean
  options?: Partial<ServerOptions>
}

export function useSocketIO(config: ZSocketIOConfig = {}) {
  log("setup")

  register(name)

  onInit(() => {
    requireModules("http")
  })

  on("httpInit", ({ http }) => {
    log("init")

    let io = new Server(http, {
      serveClient: false,
      cors: {
        origin: "*",
        methods: ["GET", "PUT", "POST"],
      },
      ...config.options,
    })

    emit("socketIOSetup", io)

    io.on("connection", (socket: Socket) => {
      let browserInfo = {} as any
      let ip
      try {
        ip = socket.request.connection.remoteAddress
        let ua = socket.request.headers["user-agent"]
        if (typeof ua === "string") {
          browserInfo = detect(ua)
        }
      } catch (err) {}

      // Socket ID first, to have ahomegenous coloring
      const log = Logger(
        `${socket?.id?.substr(0, 6)}:${browserInfo?.name ?? ""}:ws`
      )
      log.info(
        `connection socketId=${socket.id}, os=${browserInfo?.os}, ${browserInfo?.type}=${browserInfo?.name} ${browserInfo?.version}, ip=${ip}`
      )

      let conn = new ZSocketIOConnection(socket)

      if (config.debug) {
        socket.onAny((name: string, msg: any) => {
          log(`on '${name}':`, JSON.stringify(msg).substr(0, 40))
        })
      }

      conn.on("serverPing", (data) => {
        conn.emit("serverPong", data)
        return data
      })

      conn.on("serverConfig", () => config)

      socket.on("disconnect", () => {
        log.info("user disconnected")
        emit("socketIODisconnect", conn)
      })

      socket.on("error", () => {
        log.error("error")
        emit("socketIODisconnect", conn, "error")
      })

      emit("socketIOConnect", conn)
    })
  })
}
