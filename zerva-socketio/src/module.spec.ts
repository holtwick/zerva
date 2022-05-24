// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { emit, serve } from "@zerva/core"
import { useHttp } from "@zerva/http"
import { io } from "socket.io-client"
import { lazyListener } from "zeed"
import { ZSocketIOClientConnection, ZSocketIOConnection } from "./index"
import { useSocketIO } from "./module"

const port = 8888
const url = `ws://localhost:${port}`

describe("Socket", () => {
  beforeAll(async () => {
    useHttp({ port })
    useSocketIO({})
    await serve()
  })

  afterAll(async () => {
    await emit("serveStop")
  })

  it("should connect", async () => {
    const socket = io(url, {
      reconnectionDelayMax: 3000,
      transports: ["websocket"],
    })
    expect(socket).not.toBeNull()
    let onPong = lazyListener(socket, "serverPong")

    socket.emit("serverPing", { echo: "echo123" })
    socket.emit("serverPing", { echo: "echo987" })

    expect(await onPong()).toEqual({ echo: "echo123" })
    expect(await onPong()).toEqual({ echo: "echo987" })

    socket.close()
  })

  it("should connect typed", async () => {
    expect.assertions(2)
    const socket = io(url, {
      reconnectionDelayMax: 3000,
      transports: ["websocket"],
    })
    expect(socket).not.toBeNull()

    const conn = new ZSocketIOConnection(socket, 1000)

    let res = await conn.emit("serverPing", { echo: "echo123" })
    expect(res).toEqual({ echo: "echo123" })

    socket.close()
  })

  it("should connect with client lib", async () => {
    expect.assertions(2)
    const conn = ZSocketIOClientConnection.connect(url)
    expect(conn).not.toBeNull()
    let res = await conn?.emit("serverPing", { echo: "echo123" })
    expect(res).toEqual({ echo: "echo123" })
    conn?.close()
  })
})
