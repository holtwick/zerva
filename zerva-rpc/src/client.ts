import type { LogConfig, LoggerInterface } from 'zeed'
import { getWebsocketUrlFromLocation, WebSocketConnection } from '@zerva/websocket'
import { createPromise, Logger, useDispose } from 'zeed'
import { rpcSocketName } from './_types'
import { ResillientChannel } from './channel-resilient'
import { createRPCHub } from './rpc-hub'

const log: LoggerInterface = Logger('rpc', false)

/** Our connection to the signaling server */
export function useWebsocketRpcHubClient(url = getWebsocketUrlFromLocation(rpcSocketName), opt: {
  log?: LogConfig
  exceptions?: boolean
} = {}) {
  const rpcChannel = new ResillientChannel()
  const rpcHub = createRPCHub(rpcChannel, opt.log, opt.exceptions)

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
    rpcChannel.setChannel()
  })

  return {
    rpcHub,
    dispose,
    awaitConnection,
    channel: rpcChannel,
  }
}
