# 🌱 Zerva useHttpBun

> High-performance HTTP server using Bun and Elysia.

This is a modern reimplementation of `@zerva/http` built on [Bun](https://bun.sh) runtime and the [Elysia](https://elysiajs.com/) framework. It provides a fast, lightweight HTTP server with built-in support for compression, security features, and WebSocket.

## Features

- ⚡️ **Fast** - Built on Bun's native HTTP server and Elysia framework
- 🔒 **Secure** - CORS, security headers, CSP, and rate limiting
- 📦 **Compression** - Automatic response compression
- 🔌 **WebSocket** - Built-in WebSocket support
- 🎯 **Simple API** - Easy-to-use interface compatible with Zerva ecosystem

## Installation

```bash
bun add @zerva/http-bun
```

**Note:** This package requires Bun runtime. Install Bun from [bun.sh](https://bun.sh).

## Minimal Example

Will serve on `http://localhost:8080`:

```ts
import { serve } from '@zerva/core'
import { useHttpBun } from '@zerva/http-bun'

useHttpBun()
serve()
```

## Configuration

```ts
interface HttpBunConfig {
  host?: string              // Host to bind to (default: 'localhost')
  port?: number              // Port to listen on (default: 8080)
  sslCert?: string           // Path to SSL certificate file
  sslKey?: string            // Path to SSL key file
  
  // Security
  cors?: boolean             // Enable CORS (default: true)
  helmet?: boolean           // Enable security headers (default: true)
  csp?: boolean | string | object  // Content Security Policy
  rateLimit?: boolean | object     // Rate limiting configuration
  
  // Features
  compression?: boolean      // Enable compression (default: true)
  websocket?: boolean        // Enable WebSocket support (default: true)
  
  // Other
  showServerInfo?: boolean | 'minimal' | 'full'  // Show server info on startup
  trustProxy?: boolean       // Trust proxy headers (default: true)
}
```

## Usage Example

```ts
import { on, serve } from '@zerva/core'
import { useHttpBun } from '@zerva/http-bun'

useHttpBun({ 
  port: 3000,
  cors: true,
  compression: true,
  websocket: true
})

on('httpInit', ({ app }) => {
  // Simple GET route
  app.get('/', () => 'Hello World!')
  
  // JSON response
  app.get('/api/data', () => ({
    message: 'Hello from Elysia!',
    timestamp: Date.now()
  }))
  
  // With parameters
  app.get('/users/:id', ({ params }) => ({
    userId: params.id
  }))
  
  // Static files
  app.get('/static/*', ({ params }) => 
    Bun.file(`./public/${params['*']}`)
  )
})

serve()
```

## WebSocket Example

```ts
import { on, serve } from '@zerva/core'
import { useHttpBun } from '@zerva/http-bun'

useHttpBun({ websocket: true })

on('httpInit', ({ app }) => {
  app.ws('/ws', {
    message(ws, message) {
      ws.send(`Echo: ${message}`)
    },
    open(ws) {
      console.log('WebSocket connected')
    },
    close(ws) {
      console.log('WebSocket disconnected')
    }
  })
})

serve()
```

## Events

### httpInit
Emitted before the server starts. Use this to set up routes and middleware.

```ts
on('httpInit', ({ app }) => {
  // Configure your routes here
})
```

### httpRunning
Emitted after the server is listening.

```ts
on('httpRunning', ({ url, port, host }) => {
  console.log(`Server running at ${url}`)
})
```

### httpStop
Emitted when the server is stopping.

```ts
on('httpStop', () => {
  // Cleanup
})
```

## Differences from @zerva/http

- Built on Bun instead of Node.js
- Uses Elysia instead of Express
- Native WebSocket support (no separate library needed)
- Faster performance due to Bun's optimizations
- Simpler implementation with less complexity

## License

MIT
