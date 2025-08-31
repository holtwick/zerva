import { on, serve, serveStop, setContext } from '@zerva/core'
import { useHttp } from '@zerva/http'
import WebSocket from 'ws'
import { createPromise, sleep, stringToUInt8Array, Uint8ArrayToString, useDispose, waitOn } from 'zeed'
import { WebSocketConnection } from './client'
import { useWebSocket } from './use'

// @ts-expect-error xxx
globalThis.WebSocket = WebSocket

const port = 8887
const webSocketPath = '/testReliability'
const url = `ws://localhost:${port}${webSocketPath}`

describe('reliability tests', () => {
  const dispose = useDispose()

  beforeAll(async () => {
    setContext()

    useHttp({ port })
    dispose.add(useWebSocket({ path: webSocketPath, pingInterval: 5000 }))

    on('webSocketConnect', ({ channel }) => {
      channel.on('message', (msg) => {
        // Echo messages back
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
  }, 15000)

  it('should handle connection timeout gracefully', async () => {
    // Test with a non-existent server to trigger timeout
    const badUrl = 'ws://localhost:9999/nonexistent'
    const channel = new WebSocketConnection(badUrl, {
      connectionTimeout: 1000, // 1 second timeout
      messageReconnectTimeout: 500,
    })

    // Should not connect within timeout
    const connected = await channel.awaitConnect(2000)
    expect(connected).toBe(false)

    await channel.dispose()
  }, 10000)

  it('should handle rapid reconnections without resource leaks', async () => {
    const channel = new WebSocketConnection(url, {
      connectionTimeout: 2000,
      messageReconnectTimeout: 500,
      reconnectTimeoutBase: 100, // Fast reconnects for testing
    })

    await channel.awaitConnect(5000)
    expect(channel.isConnected).toBe(true)

    // Simulate network issues by forcing disconnections and reconnections
    for (let i = 0; i < 5; i++) {
      channel._reconnect()
      await sleep(100)

      // Should reconnect successfully
      const reconnected = await channel.awaitConnect(3000)
      expect(reconnected).toBe(true)
    }

    await channel.dispose()
  }, 20000)

  it('should handle message buffering correctly', async () => {
    const channel = new WebSocketConnection(url)
    await channel.awaitConnect(5000)

    // Send multiple messages rapidly
    const messages = []
    const responses = []

    for (let i = 0; i < 10; i++) {
      const message = `test-message-${i}`
      messages.push(message)

      channel.postMessage(stringToUInt8Array(message))

      // Collect responses
      const response = await waitOn(channel, 'message')
      responses.push(Uint8ArrayToString(response.data))
    }

    // All messages should be echoed back
    expect(responses.sort()).toEqual(messages.sort())

    await channel.dispose()
  }, 15000)

  it('should handle connection disposal without hanging', async () => {
    const channels = []

    // Create multiple connections
    for (let i = 0; i < 5; i++) {
      const channel = new WebSocketConnection(url)
      await channel.awaitConnect(5000)
      channels.push(channel)
    }

    // Dispose all connections
    const disposePromises = channels.map(channel => channel.dispose())

    // Should all dispose within reasonable time
    await Promise.all(disposePromises)

    // Wait a bit for the disposal to complete
    await sleep(100)

    // Verify all are disconnected
    for (const channel of channels) {
      expect(channel.isConnected).toBe(false)
    }
  }, 10000)

  it('should handle server buffer limits gracefully', async () => {
    const channel = new WebSocketConnection(url)
    await channel.awaitConnect(5000)

    // Send some messages normally to test buffer handling
    for (let i = 0; i < 5; i++) {
      channel.postMessage(stringToUInt8Array(`buffered-${i}`))
    }

    // Wait for processing
    await sleep(100)

    await channel.dispose()
  }, 10000)

  it('should handle ping/pong correctly with timing', async () => {
    const channel = new WebSocketConnection(url, {
      messageReconnectTimeout: 1000, // Ping every 500ms
    })

    await channel.awaitConnect(5000)

    // Wait for a few ping cycles
    await sleep(1800) // Should trigger ~3 pings (1800ms / 500ms = 3.6)

    // Should have received some pongs
    expect(channel.pingCount).toBeGreaterThanOrEqual(2)
    expect(channel.pingCount).toBeLessThanOrEqual(4) // Allow some timing variance

    await channel.dispose()
  }, 10000)
})
