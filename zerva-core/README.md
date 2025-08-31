# 🌱 @zerva/core

[![npm version](https://img.shields.io/npm/v/@zerva/core.svg)](https://www.npmjs.com/package/@zerva/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Event-driven server foundation for building modular web services**

The core of the [Zerva](https://github.com/holtwick/zerva) ecosystem - a minimal, powerful foundation for creating event-driven web services with a clean module system and lifecycle management.

## ✨ Features

- 🎯 **Event-driven architecture** - Clean separation of concerns
- 🔧 **Modular design** - Composable, reusable modules
- ⚡ **Lightweight core** - Minimal footprint, maximum flexibility
- 🔄 **Lifecycle management** - Structured startup and shutdown
- 🎪 **Dependency system** - Automatic module loading and ordering
- 📡 **Global context** - Simplified event bus with implicit context
- 🛠️ **TypeScript first** - Full type safety and IDE support
- 🎨 **Clean APIs** - Intuitive, consistent module interfaces

## 📦 Installation

```bash
npm install @zerva/core
# or
pnpm add @zerva/core
# or
yarn add @zerva/core
```

## 🚀 Quick Start

### Basic Server Setup

```typescript
// main.ts
import { serve } from '@zerva/core'
import { useHttp } from '@zerva/http'

// Setup HTTP server
useHttp({
  port: 8080,
  showServerInfo: true
})

// Start the server
serve()
```

### Package.json Setup

```json
{
  "name": "my-zerva-app",
  "type": "module",
  "version": "1.0.0",
  "scripts": {
    "dev": "zerva",
    "build": "zerva build",
    "start": "node dist/main.cjs"
  },
  "devDependencies": {
    "@zerva/bin": "^0.73.0",
    "@zerva/core": "^0.73.0",
    "@zerva/http": "^0.73.0"
  }
}
```

### Run Your Server

```bash
npm run dev
# Server starts with hot-reload
# 🌐 Zerva: http://localhost:8080 (🚧 DEVELOPMENT)
```

## 📋 Core Concepts

### Event-Driven Architecture

Zerva uses a global event system where modules communicate through events:

```typescript
import { on, emit } from '@zerva/core'

// Listen to events
on('userRegistered', async (user) => {
  console.log(`Welcome ${user.name}!`)
  await sendWelcomeEmail(user)
})

// Emit events
await emit('userRegistered', { name: 'Alice', email: 'alice@example.com' })
```

### Module System

Modules are functions that hook into the event system:

```typescript
function useCounter() {
  let count = 0
  
  // Listen to HTTP module initialization
  on('httpInit', ({ onGET }) => {
    onGET('/counter', () => `Count: ${++count}`)
    onGET('/reset', () => {
      count = 0
      return 'Reset!'
    })
  })
  
  return {
    getCount: () => count
  }
}

// Use the module
const counter = useCounter()
```

## 🔄 Lifecycle Management

### Server Lifecycle Events

The `serve()` function orchestrates the application lifecycle:

```typescript
import { on, serve } from '@zerva/core'

// Lifecycle events (in order)
on('serveInit', async () => {
  console.log('🔧 Initializing modules...')
  // Setup configuration, database connections, etc.
})

on('serveStart', async () => {
  console.log('🚀 Starting services...')
  // Start HTTP servers, connect to external services, etc.
})

on('serveStop', async () => {
  console.log('🛑 Stopping services...')
  // Close connections, cleanup resources
})

on('serveDispose', async () => {
  console.log('🧹 Final cleanup...')
  // Release final resources
})

serve()
```

### Graceful Shutdown

Zerva handles graceful shutdown automatically:

```typescript
// Automatic handling of SIGTERM, SIGINT signals
// Calls serveStop() and serveDispose() in order
// Your cleanup code runs before process exit
```

## 🔌 Module Dependencies

### Declaring Dependencies

Ensure modules load in the correct order:

```typescript
import { register } from '@zerva/core'

function useDatabase() {
  register('database', []) // No dependencies
  
  on('serveInit', async () => {
    // Initialize database connection
  })
}

function useUserService() {
  register('userService', ['database', 'http']) // Depends on database and http
  
  on('serveInit', async () => {
    // Setup user routes and database queries
  })
}
```

### Module Registration

```typescript
function useAuth() {
  register('auth', ['http', 'database'])
  
  let sessions = new Map()
  
  on('httpInit', ({ onPOST, addMiddleware }) => {
    // Add auth middleware
    addMiddleware((req, res, next) => {
      // Check authentication
      next()
    })
    
    onPOST('/login', async (req) => {
      // Handle login
      return { token: 'abc123' }
    })
  })
  
  return {
    validateSession: (token) => sessions.has(token)
  }
}
```

## 🎪 Advanced Usage

### Custom Module with Events

```typescript
function useNotifications() {
  register('notifications')
  
  const subscribers = new Set()
  
  // Listen to app events
  on('userRegistered', async (user) => {
    await emit('notificationSend', {
      to: user.email,
      subject: 'Welcome!',
      body: 'Thanks for joining!'
    })
  })
  
  on('notificationSend', async (notification) => {
    console.log(`📧 Sending: ${notification.subject}`)
    // Send email, push notification, etc.
  })
  
  return {
    subscribe: (callback) => subscribers.add(callback),
    unsubscribe: (callback) => subscribers.delete(callback)
  }
}
```

### Multiple Contexts

For advanced use cases with isolated contexts:

```typescript
import { createContext, withContext } from '@zerva/core'

const mainContext = createContext()
const workerContext = createContext()

// Main application
withContext(mainContext, () => {
  useHttp({ port: 3000 })
  serve()
})

// Worker process
withContext(workerContext, () => {
  useBackgroundJobs()
  serve()
})
```

### Conditional Module Loading

```typescript
function setupEnvironment() {
  if (process.env.NODE_ENV === 'development') {
    useDevelopmentTools()
    useHotReload()
  }
  
  if (process.env.ENABLE_METRICS === 'true') {
    useMetrics()
    useHealthChecks()
  }
}

function useDevelopmentTools() {
  on('httpInit', ({ onGET }) => {
    onGET('/dev/reload', () => {
      process.exit(0) // Will be restarted by zerva-bin
    })
  })
}
```

## 🧪 Testing

### Testing Modules

```typescript
// test/counter.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createContext, withContext, emit, on } from '@zerva/core'

describe('Counter Module', () => {
  let context
  
  beforeEach(() => {
    context = createContext()
  })
  
  it('should increment counter', async () => {
    let counter = 0
    
    await withContext(context, async () => {
      on('increment', () => counter++)
      await emit('increment')
      expect(counter).toBe(1)
    })
  })
})
```

### Integration Testing

```typescript
// test/integration.test.ts
import request from 'supertest'
import { serve } from '@zerva/core'
import { useHttp } from '@zerva/http'

describe('Server Integration', () => {
  it('should start server and respond', async () => {
    const { app } = useHttp({ port: 0 }) // Random port
    
    on('httpInit', ({ onGET }) => {
      onGET('/health', () => ({ status: 'ok' }))
    })
    
    await serve()
    
    const response = await request(app)
      .get('/health')
      .expect(200)
    
    expect(response.body.status).toBe('ok')
  })
})
```

## 🏗️ Project Structure

### Recommended Structure

```
my-zerva-app/
├── src/
│   ├── main.ts              # Entry point
│   ├── modules/             # Custom modules
│   │   ├── auth.ts         # Authentication module
│   │   ├── users.ts        # User management
│   │   └── notifications.ts # Notification system
│   ├── routes/             # HTTP route handlers
│   ├── services/           # Business logic
│   ├── utils/              # Shared utilities
│   └── types/              # TypeScript types
├── test/                   # Test files
├── dist/                   # Built files (auto-generated)
├── package.json
└── tsconfig.json
```

### Module Organization

```typescript
// src/modules/users.ts
import { register, on } from '@zerva/core'

export function useUsers() {
  register('users', ['database', 'http'])
  
  const users = new Map()
  
  on('httpInit', ({ onGET, onPOST }) => {
    onGET('/users', () => Array.from(users.values()))
    onPOST('/users', async (req) => {
      const user = { id: Date.now(), ...req.body }
      users.set(user.id, user)
      
      await emit('userCreated', user)
      return user
    })
  })
  
  return {
    getUser: (id) => users.get(id),
    getAllUsers: () => Array.from(users.values())
  }
}
```

## 🔧 Conditional Compilation

Use build-time defines for environment-specific code:

```typescript
// This code only runs in development
if (ZERVA_DEVELOPMENT) {
  console.log('Development mode - enabling debug features')
  useDevelopmentTools()
}

// This code only runs in production
if (ZERVA_PRODUCTION) {
  useProductionOptimizations()
  useMonitoring()
}

// Alternative syntax
if (process.env.ZERVA_DEVELOPMENT === 'true') {
  // Development-only code
}
```

### Available Defines

- `ZERVA_DEVELOPMENT`: `true` in development mode
- `ZERVA_PRODUCTION`: `true` in production builds

## 📚 Available Modules

Core ecosystem modules you can use with `@zerva/core`:

- [`@zerva/http`](https://www.npmjs.com/package/@zerva/http) - HTTP server with Express
- [`@zerva/websocket`](https://www.npmjs.com/package/@zerva/websocket) - WebSocket support  
- [`@zerva/vite`](https://www.npmjs.com/package/@zerva/vite) - Vite development server integration
- [`@zerva/sqlite`](https://www.npmjs.com/package/@zerva/sqlite) - SQLite database
- [`@zerva/mqtt`](https://www.npmjs.com/package/@zerva/mqtt) - MQTT client/server
- [`@zerva/email`](https://www.npmjs.com/package/@zerva/email) - Email sending
- [`@zerva/rpc`](https://www.npmjs.com/package/@zerva/rpc) - RPC communication
- [`@zerva/openapi`](https://www.npmjs.com/package/@zerva/openapi) - OpenAPI/Swagger docs

## 🐳 Docker Integration

Zerva works perfectly with Docker:

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy built application
COPY dist/ ./dist/

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "dist/main.cjs"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - ZERVA_PRODUCTION=true
```

## 📚 Examples

Check out the [examples directory](https://github.com/holtwick/zerva/tree/main/examples) for complete applications:

- [**Minimal**](https://github.com/holtwick/zerva/tree/main/examples/minimal) - Simplest possible setup
- [**Full-Stack**](https://github.com/holtwick/zerva/tree/main/examples/vite) - Complete app with frontend
- [**WebSocket Chat**](https://github.com/holtwick/zerva/tree/main/examples/websocket) - Real-time communication
- [**RPC Service**](https://github.com/holtwick/zerva/tree/main/examples/rpc) - Service-to-service communication

## 🤝 Related Projects

- [`zeed`](https://github.com/holtwick/zeed) - Utility library and logging system
- [`zeed-dom`](https://github.com/holtwick/zeed-dom) - Lightweight offline DOM for server-side rendering

## 📄 License

MIT License - see [LICENSE](https://github.com/holtwick/zerva/blob/main/LICENSE) file for details.

## 🙋‍♂️ Support

- 📖 [Documentation](https://github.com/holtwick/zerva)
- 🐛 [Bug Reports](https://github.com/holtwick/zerva/issues)
- 💬 [Discussions](https://github.com/holtwick/zerva/discussions)
- ❤️ [Sponsor](https://github.com/sponsors/holtwick)
