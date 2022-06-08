// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { emit, on, serve } from "@zerva/core"
import { useHttp } from "@zerva/http"
import WebSocket from "ws"
import {
  createPromise,
  Logger, Uint8ArrayToString, waitOn
} from "zeed"
import { WebSocketConnection } from "./connection"
import { useWebSocket } from "./server"
import { webSocketPath } from "./types"

// @ts-ignore
global.WebSocket = WebSocket

const log = Logger("test:module")

const port = 8886
const url = `ws://localhost:${port}${webSocketPath}`

describe("connection", () => {
  beforeAll(async () => {
    useHttp({ port })
    useWebSocket({})

    const [promise, resolve] = createPromise()

    on("webSocketConnect", ({ channel }) => {
      channel.on("message", (msg) => {
        channel.postMessage(msg.data)
      })
    })

    on("httpRunning", resolve)

    await serve()
    await promise
  })

  afterAll(async () => {
    await emit("serveStop")
  })

  it("should ping", async () => {
    const channel = new WebSocketConnection(url, {
      messageReconnectTimeout: 1200, // emits at 600
    })
    await channel.awaitConnect()

    channel.postMessage("Hello World")

    let msg = await waitOn(channel, "message")
    expect(Uint8ArrayToString(msg.data)).toMatchInlineSnapshot('"Hello World"')

    channel.close()
  }, 5000)
})