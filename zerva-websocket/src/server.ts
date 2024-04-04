// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.

import '@zerva/http'
import type { Buffer } from 'node:buffer'
import { URL } from 'node:url'
import type WebSocket from 'ws'
import { WebSocketServer } from 'ws'
import type { LogConfig, LogLevelAliasType, LoggerInterface, UseDispose } from 'zeed'
import { Channel, LogLevelInfo, Logger, LoggerFromConfig, equalBinary, uname, useDispose, uuid } from 'zeed'
import { assertModules, emit, on, once, register } from '@zerva/core'
import type { WebsocketData } from './types'
import { pingMessage, pongMessage, websocketName, wsReadyStateConnecting, wsReadyStateOpen } from './types'

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

function safeLength(data: any): number {
  try {
    return data?.length ?? data?.byteLength ?? data?.count ?? -1
  }
  catch (err: any) { }
  return -1
}

function safeType(data: any): string {
  try {
    return (data)?.constructor?.name ?? typeof data ?? 'unknown'
  }
  catch (err: any) { }
  return 'unknown'
}

export class WebsocketNodeConnection extends Channel {
  private ws: WebSocket

  public config: ZWebSocketConfig
  public name: string
  public path: string

  // After close this will be false
  public isConnected = true

  public dispose: UseDispose = useDispose()

  private log: LoggerInterface

  constructor(ws: WebSocket, config: ZWebSocketConfig = {}, log?: LoggerInterface) {
    super()

    this.config = config
    this.name = config.name!
    this.path = config.path!

    this.ws = ws
    this.ws.binaryType = 'arraybuffer'

    const id = config.debug === true ? uname(moduleName) : uuid()

    // this.log = Logger(`${id}:zerva-${moduleName}`, config.logLevel ?? false)
    this.log = log ? log.extend(id) : Logger(moduleName, false)

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
        this.log(`onmessage length=${safeLength(data)} type=${safeType(data)}`)

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

  postMessage(data: WebsocketData): void {
    if (
      this.ws.readyState != null
      && this.ws.readyState !== wsReadyStateConnecting
      && this.ws.readyState !== wsReadyStateOpen
    )
      this.close()

    try {
      this.ws.send(data)
    }
    catch (e) {
      this.close()
    }
  }

  close() {
    this.log('trigger close')
    this.dispose.sync()
    this.ws.close()
  }
}

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

        // } else {
        //   log("ignore upgrade") // this can be vite HMR e.g.
        //   // socket.destroy()
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
}
