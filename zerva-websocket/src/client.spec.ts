import { on, serve, serveStop, setContext } from '@zerva/core'
import { useHttp } from '@zerva/http'
import WebSocket from 'ws'
import { createPromise, stringToUInt8Array, Uint8ArrayToString, useDispose, waitOn } from 'zeed'
import { WebSocketConnection } from './client'
import { useWebSocket } from './use'

// @ts-expect-error xxx
globalThis.WebSocket = WebSocket

// const log = Logger("test:module")

const port = 8886
const webSocketPath = '/testClient'
const url = `ws://localhost:${port}${webSocketPath}`

describe('connection', () => {
  const dispose = useDispose()

  beforeAll(async () => {
    setContext() // Avoid conflict of multiple registration

    useHttp({ port })
    dispose.add(useWebSocket({ path: webSocketPath }))

    on('webSocketConnect', ({ channel }) => {
      channel.on('message', (msg) => {
        channel.postMessage(msg.data)
      })
    })

    const [promise, resolve] = createPromise()
    on('httpRunning', resolve)
    await serve()
    await promise
  })

  afterAll(async () => {
    await serveStop()
    await dispose()
  })

  it('should ping', async () => {
    const channel = new WebSocketConnection(url, {
      messageReconnectTimeout: 1200, // emits at 600
    })
    await channel.awaitConnect()

    channel.postMessage(stringToUInt8Array('Hello World'))

    const msg = await waitOn(channel, 'message')
    expect(Uint8ArrayToString(msg.data)).toEqual('Hello World')

    channel.dispose()
  }, 5000)
})
