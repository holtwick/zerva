import { emit, on } from '@zerva/core'
import { useWebSocket } from '@zerva/websocket'
import type { Channel, UseDisposeWithUtils, useRPCHub } from 'zeed'
import { Logger, useDisposeWithUtils } from 'zeed'
import { rpcSocketName } from './_types'
import { createRPCHub } from './rpc-hub'

const moduleName = 'websocket:rpc'
const log = Logger(moduleName, false)

type UseRPCHubType = ReturnType<typeof useRPCHub>

declare global {
  interface ZContextEvents {
    rpcConnect: (info: {
      channel: Channel
      rpcHub: UseRPCHubType
      dispose: UseDisposeWithUtils
    }) => Promise<void>
  }
}

export function useWebsocketRpcHub(info: { name?: string } = {}) {
  log.info(`use ${moduleName}`)

  const { name: rpcName = rpcSocketName } = info

  useWebSocket({
    name: rpcName,
    log: false,
  })

  on('webSocketConnect', async ({ channel, name }) => {
    if (rpcName == null || name === rpcName) {
      log('webSocketConnect')
      const dispose = useDisposeWithUtils(log.label)
      const rpcHub = createRPCHub(channel)
      await emit('rpcConnect', {
        rpcHub,
        dispose,
        channel,
      })
      channel.on('close', dispose)
    }
  })
}
