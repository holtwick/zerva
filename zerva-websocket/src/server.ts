// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.

import { assertModules, emit, on, onInit, once, register } from '@zerva/core'
import '@zerva/http'
import { parse } from 'node:url'
import type WebSocket from 'ws'
import { WebSocketServer } from 'ws'
import type { LogLevelAliasType, LoggerInterface, UseDispose } from 'zeed'
import { Channel, Logger, equalBinary, uname, useDispose } from 'zeed'
import { pingMessage, pongMessage, webSocketPath, wsReadyStateConnecting, wsReadyStateOpen } from './types'

const moduleName = 'websocket'

interface ZWebSocketConfig {
  path?: string
  pingInterval?: number
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

  // After close this will be false
  public isConnected = true

  public dispose: UseDispose = useDispose()

  private log: LoggerInterface

  constructor(ws: WebSocket, config: ZWebSocketConfig = {}) {
    super()

    this.ws = ws
    this.ws.binaryType = 'arraybuffer'

    const id = uname(moduleName)
    this.log = Logger(`${id}:zerva-${moduleName}`, config.logLevel ?? false)
    this.log.info('new connection', id)

    const { pingInterval = 30000 } = config

    // Heartbeat state
    let isAlive = true

    // Will ensure that we don't loose the connection due to inactivity
    if (pingInterval > 0) {
      this.log.info('Heartbeat interval', pingInterval)

      const heartbeatInterval = setInterval(() => {
        if (isAlive === false) {
          this.log('heartbeat failed, now close', ws)
          this.close()
        }
        isAlive = false
        ws.ping()
      }, pingInterval)

      this.dispose.add(() => clearInterval(heartbeatInterval))
    }

    ws.on('pong', () => {
      isAlive = true
    })

    ws.on('message', (data: ArrayBuffer, isBinary: boolean) => {
      try {
        this.log(`onmessage length=${safeLength(data)} type=${safeType(data)}`)

        // Hardcoded message type to allow ping from client side, sends pong
        // This is different to the hearbeat and isAlive from before!
        if (equalBinary(data, pingMessage)) {
          this.log('-> ping -> pong')
          this.postMessage(pongMessage)
        }
        else {
          this.emit('message', { data })
        }
      }
      catch (error) {
        this.log.warn('message parsing issues', error, data)
      }
    })

    ws.on('error', async (error) => {
      this.log.error('onerror', error)
      await this.dispose()
      ws.close()
      if (this.isConnected) {
        this.isConnected = false
        this.emit('close')
        emit('webSocketDisconnect', {
          channel: this as any,
          error,
        })
      }
    })

    ws.on('close', async () => {
      this.log.info('onclose')
      await this.dispose()
      if (this.isConnected) {
        this.isConnected = false
        await this.emit('close')
        await emit('webSocketDisconnect', {
          channel: this as any,
        })
      }
    })

    emit('webSocketConnect', {
      channel: this as any,
      dispose: this.dispose,
    })
  }

  postMessage(data: any): void {
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

  async close() {
    this.log('trigger close')
    await this.dispose()
    this.ws.close()
  }
}

export function useWebSocket(config: ZWebSocketConfig = {}) {
  const log = Logger(moduleName)

  log('setup')

  register(moduleName)

  onInit(() => {
    assertModules('http')
  })

  on('httpInit', ({ http }) => {
    let path = config.path ?? webSocketPath
    if (!path.startsWith('/'))
      path = `/${path}`

    log(`init path=${path}`)

    // https://github.com/websockets/ws
    // https://cheatcode.co/tutorials/how-to-set-up-a-websocket-server-with-node-js-and-express

    const wss = new WebSocketServer({
      noServer: true,
      path,
    })

    const pool = new Map<string, WebsocketNodeConnection>()

    wss.on('connection', (ws) => {
      log.info('onconnection')
      ws.isAlive = true

      const conn = new WebsocketNodeConnection(ws, config)
      const id = conn.id
      log.info('onconnection -> pool', id)
      conn.dispose.add(() => pool.delete(id))
      pool.set(id, conn)
    })

    function handleUpgrade(request: any, socket: any, head: Buffer) {
      const { pathname } = parse(request.url)
      log('onupgrade', pathname, path)
      if (pathname === path) {
        wss.handleUpgrade(request, socket, head, (ws: any) => {
          log('upgrade connection')
          wss.emit('connection', ws, request)
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
        await conn.close()
      pool.clear()

      await new Promise(resolve => wss.close(resolve))
    })
  })
}
