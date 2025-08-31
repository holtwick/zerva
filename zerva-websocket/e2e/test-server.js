/* eslint-disable node/prefer-global/buffer */
/* eslint-disable no-console */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { on, serve, serveStop, setContext } from '@zerva/core'
import { useHttp } from '@zerva/http'
import { useWebSocket } from '../src/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const port = 3000

console.log('Starting E2E test server...')

async function startServer() {
  setContext()

  // Setup HTTP server
  useHttp({
    port,
    cors: true,
    showServerInfo: false,
  })

  // Setup WebSocket server
  useWebSocket({
    path: '/ws',
    pingInterval: 5000,
    debug: true,
  })

  // Serve static test pages
  on('httpInit', ({ onGET, STATIC }) => {
    // Serve the main test page
    onGET('/', () => {
      return readFileSync(join(__dirname, 'test-page.html'), 'utf8')
    })

    // Serve reliability test page
    onGET('/reliability', () => {
      return readFileSync(join(__dirname, 'reliability-test.html'), 'utf8')
    })

    // Serve reconnection test page
    onGET('/reconnection', () => {
      return readFileSync(join(__dirname, 'reconnection-test.html'), 'utf8')
    })

    // Serve WebSocket browser bundle with proper MIME type
    onGET('/websocket-client.js', ({ $response }) => {
      $response.setHeader('Content-Type', 'application/javascript; charset=utf-8')
      $response.setHeader('Access-Control-Allow-Origin', '*')
      return readFileSync(join(__dirname, '../dist/index.browser.js'), 'utf8')
    })
  })

  // Handle WebSocket connections
  on('webSocketConnect', ({ channel }) => {
    console.log('WebSocket connection established')

    channel.on('message', (msg) => {
      const text = Buffer.from(msg.data).toString()
      console.log('Received message:', text)

      try {
        const data = JSON.parse(text)

        // Handle different message types
        switch (data.type) {
          case 'echo':
            // Echo the message back
            channel.postMessage(Buffer.from(JSON.stringify({
              type: 'echo',
              payload: data.payload,
              timestamp: Date.now(),
            })))
            break

          case 'broadcast':
            // For now, just echo back (in real scenario would broadcast to all)
            channel.postMessage(Buffer.from(JSON.stringify({
              type: 'broadcast',
              payload: data.payload,
              timestamp: Date.now(),
            })))
            break

          case 'error':
            // Simulate an error scenario
            throw new Error('Simulated error')

          case 'ping':
            // Respond with pong
            channel.postMessage(Buffer.from(JSON.stringify({
              type: 'pong',
              timestamp: Date.now(),
            })))
            break

          default:
            // Unknown message type
            channel.postMessage(Buffer.from(JSON.stringify({
              type: 'error',
              message: 'Unknown message type',
            })))
        }
      }
      catch (error) {
        console.error('Error handling message:', error)
        try {
          channel.postMessage(Buffer.from(JSON.stringify({
            type: 'error',
            message: error.message,
          })))
        }
        catch (sendError) {
          console.error('Error sending error message:', sendError)
        }
      }
    })
  })

  on('webSocketDisconnect', ({ channel, error }) => {
    console.log('WebSocket connection closed', error ? `with error: ${error.message}` : '')
  })

  await serve()
  console.log(`E2E test server running at http://localhost:${port}`)
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down test server...')
  await serveStop()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Shutting down test server...')
  await serveStop()
  process.exit(0)
})

startServer().catch((error) => {
  console.error('Failed to start test server:', error)
  process.exit(1)
})
