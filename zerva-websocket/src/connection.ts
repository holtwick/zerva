/* eslint-disable node/prefer-global/process */

import type { LogLevelAliasType, LoggerInterface } from 'zeed'
import { Channel, Logger, createPromise, equalBinary, getTimestamp, isBrowser, useDispose, useEventListener } from 'zeed'
import { getWebsocketUrlFromLocation, pingMessage, pongMessage, webSocketPath, wsReadyStateConnecting, wsReadyStateOpen } from './types'

// See lib0 and y-websocket for initial implementation

const default_reconnectTimeoutBase = 1200
const default_maxReconnectTimeout = 2500
const default_messageReconnectTimeout = 30000

export interface WebSocketConnectionOptions {
  logLevel?: LogLevelAliasType
  path?: string
  reconnectTimeoutBase?: number
  maxReconnectTimeout?: number
  messageReconnectTimeout?: number
}

const PERFORM_RETRY = true

export class WebSocketConnection extends Channel {
  public ws?: WebSocket
  public url: string | URL
  public shouldConnect = true
  public isConnected = false
  public lastMessageReceived = 0
  public unsuccessfulReconnects = 0
  public pingCount = 0

  private opt: WebSocketConnectionOptions
  private reconnectTimout: any
  private pingTimeout: any
  private log: LoggerInterface

  dispose:any = useDispose()

  constructor(url?: string, opt: WebSocketConnectionOptions = {}) {
    super()

    this.log = Logger('websocket', opt.logLevel ?? false)

    let path = opt.path ?? webSocketPath
    if (!path.startsWith('/'))
      path = `/${path}`

    this.opt = opt
    this.url = url ?? getWebsocketUrlFromLocation(path)

    if (isBrowser()) {
      this.dispose.add(useEventListener(window, 'beforeunload', () => this.dispose()))
      this.dispose.add(useEventListener(window, 'focus', () => this.ping()))
    }
    else if (typeof process !== 'undefined') {
      this.dispose.add(useEventListener(process, 'exit', () => this.dispose()))
    }

    this.dispose.add(() => this.disconnect())

    this._connect()
  }

  postMessage(data: any): void {
    if (this.ws && (this.ws.readyState != null ? (this.ws.readyState === wsReadyStateConnecting || this.ws.readyState === wsReadyStateOpen) : true)) {
      try {
        this.ws.send(data)
        return
      }
      catch (e) {
        this.log.warn(`send failed with error=${String(e)}`)
      }
    }
    else {
      this.log.warn(`connection state issue, readyState=${this.ws?.readyState}`)
    }
    this._reconnect()
  }

  // Send a ping. If it fails, try to reconnect immediately
  ping() {
    this.log('ping ->')
    this.postMessage(pingMessage)
  }

  disconnect() {
    this.log('disconnect', this.ws)
    clearTimeout(this.pingTimeout)
    clearTimeout(this.reconnectTimout)
    this.shouldConnect = false
    if (this.ws != null) {
      this.ws?.close()
      this.ws = undefined
      void this.emit('disconnect') // todo see also onclose ???
    }
  }

  _reconnect() {
    this.ws?.close()
    this._connect()
  }

  _connect() {
    const {
      reconnectTimeoutBase = default_reconnectTimeoutBase,
      maxReconnectTimeout = default_maxReconnectTimeout,
      messageReconnectTimeout = default_messageReconnectTimeout,
    } = this.opt

    if (this.shouldConnect && this.ws == null) {
      this.log('=> connect', this.url, this.unsuccessfulReconnects)

      const ws = new WebSocket(this.url)

      this.ws = ws
      this.ws.binaryType = 'arraybuffer'

      this.isConnected = false

      ws.addEventListener('message', (event: any) => {
        this.log('onmessage', typeof event)

        this.lastMessageReceived = getTimestamp()
        const data = event.data as ArrayBuffer
        clearTimeout(this.pingTimeout)

        if (equalBinary(data, pongMessage)) {
          this.log('-> pong')
          this.pingCount++
          if (messageReconnectTimeout > 0) {
            this.pingTimeout = setTimeout(
              () => this.ping(),
              messageReconnectTimeout / 2,
            )
          }
        }
        else {
          void this.emit('message', { data })
        }
      })

      const onclose = (error?: any) => {
        this.log('onclose', error, this.ws)
        clearTimeout(this.pingTimeout)

        if (this.ws != null) {
          this.ws = undefined

          if (error)
            this.log.warn('onclose with error')
          else
            this.log('onclose')

          if (this.isConnected) {
            this.isConnected = false
            void this.emit('disconnect')
          }
          else {
            this.unsuccessfulReconnects++
          }

          if (PERFORM_RETRY) {
            // Start with no reconnect timeout and increase timeout by
            // log10(wsUnsuccessfulReconnects).
            // The idea is to increase reconnect timeout slowly and have no reconnect
            // timeout at the beginning (this.log(1) = 0)
            const reconnectDelay = Math.min(Math.log10(this.unsuccessfulReconnects + 1) * reconnectTimeoutBase, maxReconnectTimeout)
            this.reconnectTimout = setTimeout(
              () => this._connect(),
              reconnectDelay,
            )
            this.log(`reconnect retry in ${reconnectDelay}ms`)
          }
          else {
            this.log.warn('no retry, only one!')
          }
        }
      }

      ws.addEventListener('close', () => onclose())
      ws.addEventListener('error', (error: any) => onclose(error))
      ws.addEventListener('open', () => {
        this.log('onopen') // , this.ws, ws)
        if (this.ws?.url === ws.url) {
          this.lastMessageReceived = getTimestamp()
          this.isConnected = true
          this.unsuccessfulReconnects = 0
          if (messageReconnectTimeout > 0) {
            this.log(`schedule next ping in ${messageReconnectTimeout / 2}ms`)
            this.pingTimeout = setTimeout(
              () => this.ping(),
              messageReconnectTimeout / 2,
            )
          }
          void this.emit('connect')
        }
        else {
          this.log.warn('onopen connections do not match', this.ws, ws)
        }
      })
    }
  }

  connect() {
    this.log('connect')
    this.shouldConnect = true
    if (!this.isConnected && this.ws == null)
      this._connect()
  }

  async awaitConnect(): Promise<boolean> {
    if (this.isConnected)
      return true
    const [promise, resolve] = createPromise<boolean>()
    this.once('connect', () => resolve(true))
    return promise
  }
}
