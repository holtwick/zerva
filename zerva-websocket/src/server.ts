import type { Buffer } from 'node:buffer'
import type WebSocket from 'ws'
import type { LogConfig, LoggerInterface, LogLevelAliasType, UseDispose } from 'zeed'
import { URL } from 'node:url'
import { assertModules, emit, on, once, register } from '@zerva/core'
import { WebSocketServer } from 'ws'
import { Channel, equalBinary, LoggerFromConfig, LogLevelInfo, uname, useDispose, uuid } from 'zeed'
import { pingMessage, pongMessage, websocketName, wsReadyStateOpen } from './_types'
import { useSingletonFlag } from './singleton'
import '@zerva/http'

const moduleName = 'websocket'

declare module 'ws' {
  interface WebSocket {
    isAlive?: boolean
  }
}

interface ZWebSocketConfig {
  log?: LogConfig
  debug?: boolean
  name?: string
  path?: string
  pingInterval?: number

  /** @deprecated use log */
  logLevel?: LogLevelAliasType
}

let counter = 0

export class WebsocketNodeConnection extends Channel {
  private ws: WebSocket

  public config: ZWebSocketConfig
  public name: string
  public path: string

  // After close this will be false
  public isConnected = true

  public dispose: UseDispose = useDispose()

  private log: LoggerInterface

  private buffer: Uint8Array[] = []

  constructor(ws: WebSocket, config: ZWebSocketConfig = {}) {
    super()

    this.config = config
    this.name = config.name!
    this.path = config.path!

    this.ws = ws
    this.ws.binaryType = 'arraybuffer'

    const id = config.debug === true ? uname(moduleName) : uuid()

    // this.log = Logger(`${id}:zerva-${moduleName}`, config.logLevel ?? false)
    this.log = LoggerFromConfig(config.log, `${moduleName}-${++counter}`, LogLevelInfo)

    this.log('new connection', id)

    const { pingInterval = 30000 } = config

    // Heartbeat state
    let isAlive = true

    // Will ensure that we don't loose the connection due to inactivity
    if (pingInterval > 0) {
      this.log('Heartbeat interval', pingInterval)

      const heartbeatInterval = setInterval(() => {
        if (isAlive === false) {
          this.log('heartbeat failed, now close', ws)
          this.close()
        }
        isAlive = false
        ws.ping()
      }, pingInterval)

      this.dispose.add(() => {
        heartbeatInterval.unref()
        clearInterval(heartbeatInterval)
      })
    }

    ws.on('pong', () => {
      isAlive = true
    })

    ws.on('message', async (data: ArrayBuffer) => {
      try {
        this.log(`onmessage length=${data.byteLength}`, data)

        // Hardcoded message type to allow ping from client side, sends pong
        // This is different to the hearbeat and isAlive from before!
        if (equalBinary(data, pingMessage)) {
          this.log('-> ping -> pong')
          this.postMessage(pongMessage)
        }
        else {
          await this.emit('message', { data })
        }
      }
      catch (error) {
        this.log.warn('message parsing issues', error, data)
      }
    })

    // function asyncVoid(fn: (..._args: any) => Promise<any>) {
    //   return (...args: any) => {
    //     void fn(...args)
    //   }
    // }

    ws.on('error', async (error) => {
      this.log.error('onerror', error)
      await this.dispose()
      ws.close()
      if (this.isConnected) {
        this.isConnected = false
        await this.emit('close')
        await emit('webSocketDisconnect', {
          channel: this as any,
          name: config.name,
          path: config.path,
          error,
        })
      }
    })

    ws.on('close', async () => {
      this.log('onclose')
      await this.dispose()
      if (this.isConnected) {
        this.isConnected = false
        await this.emit('close')
        await emit('webSocketDisconnect', {
          channel: this as any,
        })
      }
    })

    void emit('webSocketConnect', {
      channel: this as any,
      name: config.name,
      path: config.path,
      dispose: this.dispose,
    })
  }

  flush(): boolean {
    try {
      while (this.buffer.length > 0) {
        if (this.ws.readyState === wsReadyStateOpen)
          this.ws.send(this.buffer[0])
        else
          return false
        this.buffer.shift()
      }
      return true
    }
    catch (e) {
      this.log.warn('Error for flush occured', e)
      this.close()
    }
    return false
  }

  postMessage(data: Uint8Array): void {
    this.flush()
    try {
      if (data != null && data.byteLength) {
        if (this.ws.readyState === wsReadyStateOpen) {
          this.ws.send(data)
        }
        else {
          this.log('not ready for send', this.ws.readyState)
          this.buffer.push(data)
        }
      }
    }
    catch (e) {
      this.log.warn('Error for send occured', e)
      this.close()
    }
  }

  close() {
    this.log('trigger close')
    this.dispose.sync()
    this.ws.close()
  }
}

/**
 * - Integrates well in Express and Vite
 * - Heartbeat ping/pong from both sides
 */
export function useWebSocket(config: ZWebSocketConfig = {}) {
  const log = LoggerFromConfig(config?.log ?? true, moduleName, config.logLevel ?? LogLevelInfo)

  log('setup')

  register(moduleName)

  on('serveInit', () => {
    assertModules('http')
  })

  config.name ??= websocketName

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

      // @ts-expect-error Strange... see types.ts
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
}
