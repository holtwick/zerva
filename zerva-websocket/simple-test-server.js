/* eslint-disable no-console */
import { readFileSync } from 'node:fs'
// Simple WebSocket test server
import { createServer } from 'node:http'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { WebSocketServer } from 'ws'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const server = createServer((req, res) => {
  console.log(`HTTP ${req.method} ${req.url}`)

  if (req.url === '/') {
    const html = readFileSync(join(__dirname, 'e2e', 'test-page.html'), 'utf8')
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(html)
  }
  else if (req.url === '/debug') {
    const html = readFileSync(join(__dirname, 'debug-test.html'), 'utf8')
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(html)
  }
  else if (req.url === '/websocket-client.js') {
    const bundle = readFileSync(join(__dirname, 'dist', 'index.browser.js'), 'utf8')
    res.writeHead(200, {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    })
    res.end(bundle)
  }
  else {
    res.writeHead(404)
    res.end('Not Found')
  }
})

const wss = new WebSocketServer({
  server,
  path: '/ws',
})

wss.on('connection', (ws, req) => {
  console.log('WebSocket connection established')

  ws.on('message', (data) => {
    const text = data.toString()
    console.log('Received:', text)

    try {
      const msg = JSON.parse(text)

      // Echo the message back with some modifications
      const response = {
        type: msg.type,
        payload: msg.payload,
        timestamp: Date.now(),
        echo: true,
      }

      ws.send(JSON.stringify(response))
    }
    catch (error) {
      console.error('Message parse error:', error)
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid JSON',
      }))
    }
  })

  ws.on('close', () => {
    console.log('WebSocket connection closed')
  })

  ws.on('error', (error) => {
    console.error('WebSocket error:', error)
  })
})

const port = 3000
server.listen(port, () => {
  console.log(`Simple WebSocket test server running on http://localhost:${port}`)
  console.log(`WebSocket endpoint: ws://localhost:${port}/ws`)
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...')
  server.close(() => {
    process.exit(0)
  })
})
