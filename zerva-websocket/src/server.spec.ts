import type { MessageDefinitions } from 'zeed'
import { on, serve, serveStop, setContext } from '@zerva/core'
import { useHttp } from '@zerva/http'
import WebSocket from 'ws'
import { createPromise, Logger, sleep, useMessageHub, uuid } from 'zeed'
import { webSocketPath } from './_types'
import { WebSocketConnection } from './client'
import { useWebSocket } from './use'

// @ts-expect-error xxx
globalThis.WebSocket = WebSocket

const log = Logger('test:module')

const port = 8889
const url = `ws://localhost:${port}${webSocketPath}`

interface WebsocketActions extends MessageDefinitions {
  echo: (value: any) => Promise<any>
  throwsError: () => Promise<void>
}

describe('module', () => {
  beforeAll(async () => {
    setContext() // Avoid conflict of multiple registration

    useHttp({ port })
    useWebSocket({})

    on('webSocketConnect', ({ channel }) => {
      useMessageHub({
        channel,
      }).listen<WebsocketActions>({
        echo(value) {
          log('echo', value)
          return value
        },
        throwsError() {
          throw new Error('fakeError')
        },
      })
    })

    const [promise, resolve] = createPromise()
    on('httpRunning', resolve)
    await serve()
    await promise
  })

  afterAll(serveStop)

  // it("should connect", () =>
  //   new Promise((done) => {
  //     expect.assertions(1)

  //     const socket = new WebSocket(url)
  //      socket.binaryType = "arraybuffer"

  //     // @ts-ignore
  //     const channel = new WebsocketChannel(socket)

  //     const bridge = useMessageHub({ channel }).send<WebsocketActions>()

  //     socket.addEventListener("open", async (event) => {
  //       const id = uuid()
  //       let result = await bridge.echo({ id })
  //       log("result", result)
  //       expect(result).toEqual({ id })
  //       // channel.close()
  //       socket.close()
  //       await sleep(500)
  //       done()
  //     })
  //   }))

  // it("should connect using helper", async () => {
  //   const channel = await openWebSocketChannel(url)
  //   const bridge = useMessageHub({ channel }).send<WebsocketActions>()

  //   const id = uuid()
  //   let result = await bridge.echo({ id })
  //   log("result", result)
  //   expect(result).toEqual({ id })

  //   channel.close()
  // })

  it('should connect use smart connection', async () => {
    expect.assertions(2)

    const channel = new WebSocketConnection(url)
    const bridge = useMessageHub({ channel }).send<WebsocketActions>()
    // await sleep(500)

    const id = uuid()
    const result = await bridge.echo({ id })
    log('result', result)
    expect(result).toEqual({ id })

    try {
      await bridge.throwsError()
    }
    catch (err) {
      expect(err.message).toBe('fakeError')
    }

    await channel.dispose()
  })

  it('should ping', async () => {
    const channel = new WebSocketConnection(url, {
      messageReconnectTimeout: 1200, // emits at 600
    })
    useMessageHub({ channel }).send<WebsocketActions>()
    await sleep(2000)
    // 2000 / 600 = 3.333...
    expect(channel.pingCount).toBe(3)
    await channel.dispose()
  }, 5000)
})
