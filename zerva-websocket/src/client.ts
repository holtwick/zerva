/* eslint-disable node/prefer-global/process */

import type { LogConfig, LoggerInterface } from 'zeed'
import { Channel, createPromise, equalBinary, getTimestamp, isBrowser, LoggerFromConfig, LogLevelInfo, useDispose, useEventListener } from 'zeed'
import { pingMessage, pongMessage, webSocketPath, wsReadyStateConnecting, wsReadyStateOpen } from './_types'

// See lib0 and y-websocket for initial implementation

const default_reconnectTimeoutBase = 1200 // 1.2s
const default_maxReconnectTimeout = 2500 // 2.5s
const default_messageReconnectTimeout = 30000 // 30s

/** Find the correct websocket URL by taking into consideration the `location` e.g. `https` leads to `wss` */
export function getWebsocketUrlFromLocation(path: string = webSocketPath) {
  if (!path.startsWith('/'))
    path = `/${path}`
  return `ws${location.protocol.substring(4)}//${location.host}${path}`
}

let counter = 0

export interface WebSocketConnectionOptions {
  log?: LogConfig
  path?: string
  reconnectTimeoutBase?: number
  maxReconnectTimeout?: number
  messageReconnectTimeout?: number
  connectionTimeout?: number
}

const PERFORM_RETRY = true

export class WebSocketConnection extends Channel {
  public ws?: WebSocket
  public url: string
  public shouldConnect = true
  public isConnected = false
  public lastMessageReceived = 0
  public unsuccessfulReconnects = 0
  public pingCount = 0

  private opt: WebSocketConnectionOptions
  private reconnectTimout: any
  private pingTimeout: any
  private log: LoggerInterface

  dispose = useDispose()

  constructor(url?: string, opt: WebSocketConnectionOptions = {}) {
    super()

    this.log = LoggerFromConfig(opt.log, `websocket-${++counter}`, LogLevelInfo)

    let path = opt.path ?? webSocketPath
    if (!path.startsWith('/'))
      path = `/${path}`

    this.opt = opt
    this.url = url ?? getWebsocketUrlFromLocation(path)

    // this.dispose.add(useSingletonFlag(`_zerva_websocket_client_${this.url}`, this.log))

    if (isBrowser()) {
      this.dispose.add(useEventListener(window, 'beforeunload', () => this.dispose()))
      this.dispose.add(useEventListener(window, 'focus', () => this.ping()))
    }
    else if (typeof process !== 'undefined') {
      this.dispose.add(useEventListener(process, 'exit', () => this.dispose()))
    }

    this.dispose.add(() => this.disconnect())

    this.log.info('setup websocket connection at', this.url)

    this._connect()
  }

  postMessage(data: Uint8Array): void {
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
    this.isConnected = false
    if (this.ws != null) {
      try {
        this.ws.close()
      }
      catch (error) {
        this.log.warn('error closing websocket', error)
      }
      this.ws = undefined
      void this.emit('disconnect') // todo see also onclose ???
    }
  }

  _reconnect() {
    // Clear existing timers to prevent orphaned timers
    clearTimeout(this.pingTimeout)
    clearTimeout(this.reconnectTimout)

    // Close existing connection if any
    if (this.ws) {
      try {
        // Only close if the websocket is in a closeable state
        if (this.ws.readyState === wsReadyStateOpen || this.ws.readyState === wsReadyStateConnecting) {
          this.ws.close()
        }
      }
      catch (error) {
        this.log.warn('error closing websocket during reconnect', error)
      }
      this.ws = undefined
    }

    // Reset connection state
    this.isConnected = false

    // Connect after a short delay to avoid race conditions
    setTimeout(() => this._connect(), 10)
  }

  _connect() {
    try {
      const {
        reconnectTimeoutBase = default_reconnectTimeoutBase,
        maxReconnectTimeout = default_maxReconnectTimeout,
        messageReconnectTimeout = default_messageReconnectTimeout,
      } = this.opt

      if (this.shouldConnect && this.ws == null) {
        this.log('=> connect', this.url, this.unsuccessfulReconnects)

        const ws = new WebSocket(this.url)
        ws.binaryType = 'arraybuffer'
        this.ws = ws

        this.isConnected = false

        // Add connection timeout to prevent hanging
        const connectionTimeout = setTimeout(() => {
          if (!this.isConnected && this.ws === ws) {
            this.log.warn('connection timeout')
            ws.close()
          }
        }, this.opt.connectionTimeout ?? 10000) // Use configured timeout or default to 10 seconds

        ws.addEventListener('message', (event: any) => {
          try {
            this.log('onmessage', event)

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
          }
          catch (err) {
            this.log.warn('onmessage', err, event.data)
          }
        })

        const onclose = (error?: any) => {
          this.log('onclose', error, this.ws)
          clearTimeout(this.pingTimeout)
          clearTimeout(connectionTimeout)

          if (this.ws === ws) {
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

            if (PERFORM_RETRY && this.shouldConnect) {
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
          clearTimeout(connectionTimeout)
          if (this.ws === ws && ws.url === this.url) {
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
            ws.close()
          }
        })
      }
    }
    catch (err) {
      this.log.warn('_connect error', err)
      if (this.shouldConnect) {
        // Retry after a short delay on connection errors
        this.reconnectTimout = setTimeout(() => this._connect(), 1000)
      }
    }
  }

  connect() {
    this.log('connect')
    this.shouldConnect = true
    if (!this.isConnected && this.ws == null)
      this._connect()
  }

  async awaitConnect(timeout = 30000): Promise<boolean> {
    if (this.isConnected)
      return true

    const [promise, resolve] = createPromise<boolean>()

    const timeoutId = setTimeout(() => {
      this.log.warn('awaitConnect timeout')
      resolve(false)
    }, timeout)

    const cleanup = () => {
      clearTimeout(timeoutId)
    }

    this.once('connect', () => {
      cleanup()
      this.log('awaited connect')
      resolve(true)
    })

    // Also handle disconnect/error cases
    this.once('disconnect', () => {
      cleanup()
      this.log.warn('awaited connect failed - disconnected')
      resolve(false)
    })

    return promise
  }
}
