// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import WebSocket from "ws"
import {
  Logger,
  LoggerNodeHandler,
  LogLevel,
  sleep,
  useMessageHub,
  uuid,
} from "zeed"
import { emit, on, serve, useHttp } from "zerva"
import { openWebSocketChannel, WebsocketChannel } from "./channel"
import { WebSocketConnection } from "./connection"
import { useWebSocket } from "./module"
import { webSocketPath } from "./types"

Logger.setHandlers([
  LoggerNodeHandler({
    level: LogLevel.debug,
    filter: "*",
    colors: true,
    fill: 32,
    nameBrackets: false,
    levelHelper: false,
  }),
])

Logger.setLock(true)

// @ts-ignore
global.WebSocket = WebSocket

const log = Logger("test:module")

const port = 8888
const url = `ws://localhost:${port}${webSocketPath}`

type WebsocketActions = {
  echo(value: any): Promise<any>
  throwsError(): Promise<void>
}

describe("module", () => {
  beforeAll(async () => {
    useHttp({ port })
    useWebSocket({})
    on("webSocketConnect", ({ channel }) => {
      useMessageHub({
        channel,
      }).listen<WebsocketActions>({
        echo(value) {
          log("echo", value)
          return value
        },
        throwsError() {
          throw new Error("fakeError")
        },
      })
    })

    await serve()
  })

  afterAll(async () => {
    await emit("serveStop")
  })

  it("should connect", (done) => {
    expect.assertions(1)

    const socket = new WebSocket(url)
    socket.binaryType = "arraybuffer"

    // @ts-ignore
    const channel = new WebsocketChannel(socket)

    const bridge = useMessageHub({ channel }).send<WebsocketActions>()

    socket.addEventListener("open", async (event) => {
      const id = uuid()
      let result = await bridge.echo({ id })
      log("result", result)
      expect(result).toEqual({ id })
      socket.close()
      await sleep(500)
      done()
    })
  })

  it("should connect using helper", async () => {
    expect.assertions(1)

    const channel = await openWebSocketChannel(url)
    const bridge = useMessageHub({ channel }).send<WebsocketActions>()

    const id = uuid()
    let result = await bridge.echo({ id })
    log("result", result)
    expect(result).toEqual({ id })
    channel.close()

    await sleep(500)
  })

  it("should connect use smart connection", async () => {
    expect.assertions(2)

    const channel = new WebSocketConnection(url)
    const bridge = useMessageHub({ channel }).send<WebsocketActions>()
    // await sleep(500)

    const id = uuid()
    let result = await bridge.echo({ id })
    log("result", result)
    expect(result).toEqual({ id })

    try {
      await bridge.throwsError()
    } catch (err) {
      // @ts-ignore
      expect(err.message).toBe("fakeError")
    }

    channel.close()
  })

  it("should ping", async () => {
    const channel = new WebSocketConnection(url, {
      messageReconnectTimeout: 1200, // emits at 600
    })
    useMessageHub({ channel }).send<WebsocketActions>()
    await sleep(2000)
    // 2000 / 600 = 3.333...
    expect(channel.pingCount).toBe(3)
    channel.close()
  }, 5000)
})
