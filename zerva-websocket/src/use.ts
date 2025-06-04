import type { Buffer } from 'node:buffer'
import type WebSocket from 'ws'
import { URL } from 'node:url'
import { assertModules, use } from '@zerva/core'
import { WebSocketServer } from 'ws'
import { useDispose } from 'zeed'
import { configSchema, moduleName } from './_server'
import { WebsocketNodeConnection } from './server'
import { useSingletonFlag } from './singleton'

/**
 * - Integrates well in Express and Vite
 * - Heartbeat ping/pong from both sides
 */
export const useWebSocket = use({
  name: moduleName,
  requires: ['http'],
  configSchema,
  setup({ config, log, on, once }) {
    on('serveInit', () => {
      assertModules('http')
    })

    let path = config.path ?? config.name
    if (!path.startsWith('/'))
      path = `/${path}`
    config.path = path

    const dispose = useDispose()
    dispose.add(useSingletonFlag(`_zerva_websocket_server_${config.path}`))

    on('httpInit', ({ http }) => {
      log(`init path=${path}`)

      // https://github.com/websockets/ws
      // https://cheatcode.co/tutorials/how-to-set-up-a-websocket-server-with-node-js-and-express

      const wss = new WebSocketServer({
        noServer: true,
        path,
      })

      const pool = new Map<string, WebsocketNodeConnection>()

      wss.on('connection', (ws: WebSocket) => {
        log.info('onconnection')

        ws.isAlive = true

        const conn = new WebsocketNodeConnection(ws, config)
        const id = conn.id
        log.info('onconnection -> pool', id)
        conn.dispose.add(() => pool.delete(id))
        pool.set(id, conn)
      })

      function handleUpgrade(req: any, socket: any, head: Buffer) {
        const { pathname } = new URL(req.url, 'https://example.com')
        log('onupgrade', pathname, path)
        if (pathname === path) {
          wss.handleUpgrade(req, socket, head, (ws: any) => {
            log('upgrade connection')
            wss.emit('connection', ws, req)
          })
        }
        else {
          log('ignore upgrade') // this can be vite HMR e.g.
          socket.destroy()
        }
      }

      http.on('upgrade', handleUpgrade)

      once('serveStop', async () => {
        log.info('server stop forced', pool)
        http.off('upgrade', handleUpgrade)

        for (const conn of pool.values())
          conn.close()
        pool.clear()

        await new Promise(resolve => wss.close(resolve))
        log.info('server stop done')
      })
    })

    return dispose
  },
})
