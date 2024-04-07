// /* eslint-disable node/prefer-global/process */

// import { sign } from 'node:crypto'
// import type { LogConfig, LoggerInterface } from 'zeed'
// import { Channel, LogLevelInfo, LoggerFromConfig, cloneObject, createPromise, equalBinary, getTimestamp, isBrowser, useDispose, useDisposeWithUtils, useEventListener } from 'zeed'
// import { pingMessage, pongMessage, webSocketPath, wsReadyStateConnecting, wsReadyStateOpen } from './_types'
// import type { WebSocketConnectionOptions } from './client'

// // See lib0 and y-websocket for initial implementation

// const default_reconnectTimeoutBase = 1200 // 1.2s
// const default_maxReconnectTimeout = 2500 // 2.5s
// const default_messageReconnectTimeout = 30000 // 30s

// const PERFORM_RETRY = true

// export function useWebsocketClient(opt: WebSocketConnectionOptions & {
//   url?: string
// }) {
//   let ws: WebSocket | undefined
//   let shouldConnect = true
//   let isConnected = false
//   let lastMessageReceived = 0
//   let unsuccessfulReconnects = 0
//   let pingCount = 0

//   let reconnectTimout: any
//   let pingTimeout: any

//   const dispose = useDisposeWithUtils()

//   const log = LoggerFromConfig(opt.log, 'websocket-client', LogLevelInfo)

//   let { path = webSocketPath } = opt
//   if (!path.startsWith('/'))
//     path = `/${path}`

//   const url = opt.url ?? getWebsocketUrlFromLocation(path)

//   if (isBrowser()) {
//     dispose.add(useEventListener(window, 'beforeunload', () => dispose()))
//     dispose.add(useEventListener(window, 'focus', () => ping()))
//   }
//   else if (typeof process !== 'undefined') {
//     dispose.add(useEventListener(process, 'exit', () => dispose()))
//   }

//   log.info('setup websocket connection at', url)

//   dispose.add(() => disconnect())
//   _connect()

//   function postMessage(data: Uint8Array): void {
//     if (ws && (ws.readyState != null ? (ws.readyState === wsReadyStateConnecting || ws.readyState === wsReadyStateOpen) : true)) {
//       try {
//         ws.send(data)
//         return
//       }
//       catch (e) {
//         log.warn(`send failed with error=${String(e)}`)
//       }
//     }
//     else {
//       log.warn(`connection state issue, readyState=${ws?.readyState}`)
//     }
//     _reconnect()
//   }

//   // Send a ping. If it fails, try to reconnect immediately
//   function ping() {
//     log('ping ->')
//     postMessage(pingMessage)
//   }

//   function disconnect() {
//     log('disconnect', ws)
//     clearTimeout(pingTimeout)
//     clearTimeout(reconnectTimout)
//     shouldConnect = false
//     if (ws != null) {
//       ws?.close()
//       ws = undefined
//       void emit('disconnect') // todo see also onclose ???
//     }
//   }

//   function _reconnect() {
//     ws?.close()
//     _connect()
//   }

//   function _connect() {
//     try {
//       const {
//         reconnectTimeoutBase = default_reconnectTimeoutBase,
//         maxReconnectTimeout = default_maxReconnectTimeout,
//         messageReconnectTimeout = default_messageReconnectTimeout,
//       } = opt

//       if (shouldConnect && ws == null) {
//         log('=> connect', url, unsuccessfulReconnects)

//         ws = new WebSocket(url)
//         ws.binaryType = 'arraybuffer'

//         isConnected = false

//         ws.addEventListener('message', (event) => {
//           try {
//             log('onmessage', event)

//             lastMessageReceived = getTimestamp()
//             const data = event.data // as ArrayBuffer
//             clearTimeout(pingTimeout)

//             if (equalBinary(data, pongMessage)) {
//               log('-> pong')
//               pingCount++
//               if (messageReconnectTimeout > 0) {
//                 pingTimeout = setTimeout(
//                   () => ping(),
//                   messageReconnectTimeout / 2,
//                 )
//               }
//             }
//             else {
//               void emit('message', { data })
//             }
//           }
//           catch (err) {
//             log.warn('onmessage', err, event.data)
//           }
//         })

//         const onclose = (error?: any) => {
//           log('onclose', error, ws)
//           clearTimeout(pingTimeout)

//           if (ws != null) {
//             ws = undefined

//             if (error)
//               log.warn('onclose with error')
//             else
//               log('onclose')

//             if (isConnected) {
//               isConnected = false
//               void emit('disconnect')
//             }
//             else {
//               unsuccessfulReconnects++
//             }

//             if (PERFORM_RETRY) {
//             // Start with no reconnect timeout and increase timeout by
//             // log10(wsUnsuccessfulReconnects).
//             // The idea is to increase reconnect timeout slowly and have no reconnect
//             // timeout at the beginning (log(1) = 0)
//               const reconnectDelay = Math.min(Math.log10(unsuccessfulReconnects + 1) * reconnectTimeoutBase, maxReconnectTimeout)
//               reconnectTimout = setTimeout(
//                 () => _connect(),
//                 reconnectDelay,
//               )
//               log(`reconnect retry in ${reconnectDelay}ms`)
//             }
//             else {
//               log.warn('no retry, only one!')
//             }
//           }
//         }

//         ws.addEventListener('close', () => onclose())
//         ws.addEventListener('error', (error: any) => onclose(error))
//         ws.addEventListener('open', () => {
//           log('onopen')
//           if (ws?.url === url) {
//             lastMessageReceived = getTimestamp()
//             isConnected = true
//             unsuccessfulReconnects = 0
//             if (messageReconnectTimeout > 0) {
//               log(`schedule next ping in ${messageReconnectTimeout / 2}ms`)
//               pingTimeout = setTimeout(
//                 () => ping(),
//                 messageReconnectTimeout / 2,
//               )
//             }
//             void emit('connect')
//           }
//           else {
//             log.warn('onopen connections do not match', ws, ws)
//           }
//         })
//       }
//     }
//     catch (err) {
//       log.warn('_connect error', err)
//     }
//   }

//   function connect() {
//     log('connect')
//     shouldConnect = true
//     if (!isConnected && ws == null)
//       _connect()
//   }

//   async function awaitConnect(): Promise<boolean> {
//     if (isConnected)
//       return true
//     const [promise, resolve] = createPromise<boolean>()
//     once('connect', () => {
//       log('awaited connect')
//       resolve(true)
//     })
//     return promise
//   }

//   return {
//     connect,
//     awaitConnect,
//   }
// }
