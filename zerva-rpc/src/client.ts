import type { LogConfig, LoggerInterface } from 'zeed'
import { Logger, ResillientChannel, createPromise, useDispose } from 'zeed'
import { WebSocketConnection, getWebsocketUrlFromLocation } from '@zerva/websocket'
import { createRPCHub } from './rpc-hub'
import { rpcSocketName } from './_types'

const log: LoggerInterface = Logger('rpc', false)

/** Our connection to the signaling server */
export function useWebsocketRpcHubClient(url = getWebsocketUrlFromLocation(rpcSocketName), opt: {
  log?: LogConfig
} = {}) {
  const rpcChannel = new ResillientChannel()
  const rpcHub = createRPCHub(rpcChannel, false) // todo log

  const websocketChannel = new WebSocketConnection(url, { log: opt.log })

  const [awaitConnection, resolve] = createPromise()

  const dispose = useDispose(log)

  dispose.add(async () => {
    // log('useWebSocket dispose')
    await websocketChannel.dispose()
  })

  websocketChannel.on('connect', () => {
    log('useWebSocket connect')
    rpcChannel.setChannel(websocketChannel)
    resolve()
  })

  websocketChannel.on('disconnect', () => {
    log('useWebSocket disconnect')
    rpcChannel.deleteChannel()
  })

  return { rpcHub, dispose, awaitConnection }
}
