# 🌱 Zerva useHttp

> Express web server with powerful middleware and lifecycle hooks.

A comprehensive HTTP server module built on Express that provides lifecycle hooks, convenient route handlers, and configurable middleware including security, compression, CORS, rate limiting, and more.

## Minimal Example

Will serve on `http://localhost:8080`:

```ts
import { serve } from '@zerva/core'
import { useHttp } from '@zerva/http'

useHttp()
serve()
```

## Lifecycle Hooks

The HTTP module emits several lifecycle events that allow you to hook into different stages of the server's lifecycle:

### `httpInit`

**Type:** `(info: zervaHttpInterface) => void`

Emitted during server initialization, before the server starts listening. This is the primary hook for setting up your routes and middleware.

**Use this to:**
- Register routes using `GET`, `POST`, `PUT`, `DELETE` handlers
- Serve static files with `STATIC`
- Add custom Express middleware via `app.use()`
- Access the raw Express `app` and Node.js `http` server

**Example:**
```ts
import { on } from '@zerva/core'

on('httpInit', ({ GET, POST, STATIC, app, http }) => {
  // Simple text response
  GET('/', 'Hello World').description('Homepage')
  
  // JSON response
  GET('/api/status', { status: 'ok' })
  
  // Handler function
  GET('/api/user/:id', async (req) => {
    return { id: req.params.id, name: 'John' }
  })
  
  // POST endpoint
  POST('/api/data', async (req) => {
    const data = req.body
    // Process data...
    return { success: true }
  })
  
  // Serve static files
  STATIC('/public', './public')
  
  // Custom middleware
  app.use((req, res, next) => {
    res.setHeader('X-Custom-Header', 'value')
    next()
  })
})
```

### `httpWillStart`

**Type:** `(info: zervaHttpInterface) => void`

Emitted just before the server begins listening. Final opportunity to make changes before the server becomes active.

**Use this to:**
- Perform last-minute configuration
- Log final server setup
- Validate configuration

**Example:**
```ts
on('httpWillStart', ({ routes }) => {
  console.log(`Starting server with ${routes.length} routes`)
})
```

### `httpRunning`

**Type:** `(info: { http: Server, port: number, family: string, address: string }) => void`

Emitted after the web server is successfully listening and ready to accept connections.

**Use this to:**
- Connect WebSocket servers
- Start background tasks
- Perform post-startup operations
- Open browser programmatically

**Example:**
```ts
on('httpRunning', ({ http, port, address }) => {
  console.log(`Server running at http://${address}:${port}`)
  
  // Attach WebSocket server
  const wss = new WebSocketServer({ server: http })
  // ...
})
```

### `httpStop`

**Type:** `() => void`

Emitted when the server is about to stop. Use this for cleanup operations before the server shuts down.

**Use this to:**
- Close database connections
- Stop background tasks
- Save state
- Cleanup resources

**Example:**
```ts
on('httpStop', async () => {
  console.log('Stopping server, cleaning up...')
  await database.close()
})
```

### `httpDidStop`

**Type:** `() => void`

Emitted after the HTTP server has completely stopped and all connections are closed.

**Use this to:**
- Final cleanup
- Log shutdown completion
- Exit processes

**Example:**
```ts
on('httpDidStop', () => {
  console.log('Server stopped successfully')
})
```

## Config

```ts
interface Config {
  // Server
  host?: string                    // Host to bind to
  port?: number                    // Port to listen on (default: 8080)
  sslCrt?: string                  // Path to SSL certificate
  sslKey?: string                  // Path to SSL key
  showServerInfo?: boolean | 'minimal' | 'full'  // Print server details (default: true)
  
  // Middleware
  noExtras?: boolean               // Disable all middleware, plain Express (default: false)
  cors?: boolean                   // Enable CORS (default: true)
  helmet?: boolean | HelmetOptions // Security headers (default: true)
  csp?: boolean | string | object  // Content Security Policy (default: false)
  securityHeaders?: boolean        // Enhanced security headers (default: false)
  rateLimit?: boolean | object     // Rate limiting (default: false)
  compression?: boolean            // Gzip compression (default: true)
  trustProxy?: boolean             // Trust proxy headers (default: true)
  
  // Body Parsers
  postLimit?: string               // Body size limit (default: '1gb')
  postJson?: boolean               // Parse application/json (default: true)
  postText?: boolean               // Parse text/plain (default: true)
  postBinary?: boolean             // Parse application/octet-stream (default: true)
  postUrlEncoded?: boolean         // Parse x-www-form-urlencoded (default: true)
  
  // Other
  openBrowser?: boolean            // Auto-open browser (default: false)
}
```

## API Reference

The `zervaHttpInterface` passed to `httpInit` and `httpWillStart` provides:

### Route Handlers

- `GET(path, handler)` - Register GET route
- `POST(path, handler)` - Register POST route  
- `PUT(path, handler)` - Register PUT route
- `DELETE(path, handler)` - Register DELETE route

Aliases: `get`, `post`, `put`, `delete`, `onGET`, `onPOST`, `onPUT`, `onDELETE`

### Static Files

- `STATIC(path, fsPath)` - Serve static files/folders
- Aliases: `addStatic`, `static`

### Raw Access

- `app` - Express application instance
- `http` - Node.js HTTP/HTTPS server
- `routes` - Array of registered routes

## Examples

### Complete Server Setup

```ts
import { serve, on } from '@zerva/core'
import { useHttp } from '@zerva/http'

useHttp({
  port: 3000,
  cors: true,
  helmet: true,
  compression: true,
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }
})

on('httpInit', ({ GET, POST, STATIC }) => {
  GET('/', 'Welcome!').description('Homepage')
  GET('/api/health', { status: 'healthy' }).description('Health check')
  POST('/api/data', async (req) => ({ received: req.body }))
  STATIC('/assets', './public')
})

on('httpRunning', ({ port }) => {
  console.log(`🚀 Server ready at http://localhost:${port}`)
})

serve()
```

### With WebSocket

```ts
on('httpRunning', ({ http }) => {
  const wss = new WebSocketServer({ server: http })
  wss.on('connection', (ws) => {
    ws.send('Connected!')
  })
})
```

See [zerva-websocket](https://github.com/holtwick/zerva-websocket) for complete WebSocket examples.
