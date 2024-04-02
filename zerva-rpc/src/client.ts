import type { LoggerInterface } from 'zeed'
import { Logger, useDispose } from 'zeed'
import { WebSocketConnection, getWebsocketUrlFromLocation } from '@zerva/websocket'
import { createRPCHub } from './rpc-hub'
import { ResillientChannel } from './channel-resilient'
import { rpcSocketName } from './_types'

const log: LoggerInterface = Logger('rpc', false)

/** Our connection to the signaling server */
export function useWebsocketRpcHubClient(url = getWebsocketUrlFromLocation(rpcSocketName)) {
  const rpcChannel = new ResillientChannel()
  const rpcHub = createRPCHub(rpcChannel)

  const websocketChannel = new WebSocketConnection(url, { logLevel: 'i' })

  const dispose = useDispose(log)

  dispose.add(async () => {
    // log('useWebSocket dispose')
    await websocketChannel.dispose()
  })

  websocketChannel.on('connect', () => {
    log('useWebSocket connect')
    rpcChannel.setChannel(websocketChannel)
  })

  websocketChannel.on('disconnect', () => {
    log('useWebSocket disconnect')
    rpcChannel.deleteChannel()
  })

  return { rpcHub, dispose }
}
