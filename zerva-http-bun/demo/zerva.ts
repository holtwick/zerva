import { on, onStart, onStop, serve } from '@zerva/core'
import { Logger, sleep, uuid } from 'zeed'
import { useHttpBun } from '../src'

const log = Logger('demo')

log('demo')

let ctr = 0

useHttpBun({
  port: 3030,
  helmet: true,
  cors: true,
  compression: true,
  websocket: true,
  showServerInfo: 'full',
})

on('httpInit', ({ app, log }) => {
  // Simple routes
  app.get('/', () => `Hello world ${uuid()}`)

  app.get('/json', () => ({
    hello: 'world',
    id: uuid(),
    timestamp: Date.now(),
  }))

  // Route with parameters
  app.get('/users/:id', ({ params }) => ({
    userId: params.id,
    message: 'User details',
  }))

  // Static file serving example
  app.get('/static/*', ({ params }) => {
    const filePath = params['*']
    return Bun.file(`./${filePath}`)
  })

  // WebSocket example
  app.ws('/ws', {
    message(ws, message) {
      log.info('WebSocket message:', message)
      ws.send(`Echo: ${message}`)
    },
    open(ws) {
      log.info('WebSocket client connected')
      ws.send('Welcome to WebSocket!')
    },
    close(ws) {
      log.info('WebSocket client disconnected')
    },
  })

  log('Routes configured')
})

onStart(() => {
  log('start')

  function next() {
    setTimeout(() => {
      log('do ...', ++ctr)
      if (ctr < 5)
        next()
    }, 1000)
  }

  next()
})

onStop(async () => {
  log('stop')
  await sleep(2000)
  log('stop done')
})

void serve()
