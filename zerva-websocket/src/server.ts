import type WebSocket from 'ws'
import type { LoggerInterface, UseDispose } from 'zeed'
import type { ZWebSocketConfig } from './_server'
import { emit } from '@zerva/core'
import { Channel, equalBinary, LoggerFromConfig, LogLevelInfo, uname, useDispose, uuid } from 'zeed'
import { moduleName } from './_server'
import { pingMessage, pongMessage, wsReadyStateOpen } from './_types'
import '@zerva/http'

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
  private maxBufferSize = 100 // Limit buffer to prevent memory issues
  private heartbeatInterval?: NodeJS.Timeout

  constructor(ws: WebSocket, config: ZWebSocketConfig) {
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

    const { pingInterval } = config

    // Heartbeat state
    let isAlive = true

    // Will ensure that we don't loose the connection due to inactivity
    if (pingInterval > 0) {
      this.log('Heartbeat interval', pingInterval)

      this.heartbeatInterval = setInterval(() => {
        if (isAlive === false) {
          this.log('heartbeat failed, now close', ws)
          this.close()
          return
        }
        isAlive = false
        try {
          ws.ping()
        }
        catch (error) {
          this.log.warn('ping failed', error)
          this.close()
        }
      }, pingInterval)

      this.dispose.add(() => {
        if (this.heartbeatInterval) {
          this.heartbeatInterval.unref()
          clearInterval(this.heartbeatInterval)
        }
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
      if (this.isConnected) {
        this.isConnected = false
        await this.dispose()
        try {
          ws.close()
        }
        catch (closeError) {
          this.log.warn('error closing websocket', closeError)
        }
        await this.emit('close')
        await emit('webSocketDisconnect', {
          channel: this as any,
          name: this.config.name,
          path: this.config.path,
          error,
        })
      }
    })

    ws.on('close', async () => {
      this.log('onclose')
      if (this.isConnected) {
        this.isConnected = false
        await this.dispose()
        await this.emit('close')
        await emit('webSocketDisconnect', {
          channel: this as any,
          name: this.config.name,
          path: this.config.path,
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
    if (!this.isConnected)
      return false

    try {
      while (this.buffer.length > 0) {
        if (this.ws.readyState === wsReadyStateOpen) {
          this.ws.send(this.buffer[0])
          this.buffer.shift()
        }
        else {
          return false
        }
      }
      return true
    }
    catch (e) {
      this.log.warn('Error during flush', e)
      this.close()
    }
    return false
  }

  postMessage(data: Uint8Array): void {
    if (!this.isConnected) {
      this.log.warn('attempted to send message on closed connection')
      return
    }

    this.flush()
    try {
      if (data != null && data.byteLength) {
        if (this.ws.readyState === wsReadyStateOpen) {
          this.ws.send(data)
        }
        else {
          this.log('not ready for send', this.ws.readyState)
          if (this.buffer.length < this.maxBufferSize) {
            this.buffer.push(data)
          }
          else {
            this.log.warn('buffer full, dropping message')
          }
        }
      }
    }
    catch (e) {
      this.log.warn('Error for send occurred', e)
      this.close()
    }
  }

  close() {
    this.log('trigger close')
    if (this.isConnected) {
      this.isConnected = false
      this.dispose.sync()
      try {
        this.ws.close()
      }
      catch (error) {
        this.log.warn('error during close', error)
      }
    }
  }
}
