import { emit, on, register } from '@zerva/core'
import type { Channel, UseDisposeWithUtils, useRPCHub } from 'zeed'
import { Logger, useDisposeWithUtils } from 'zeed'
import { useWebSocket } from '@zerva/websocket'
import { createRPCHub } from './rpc-hub'
import { rpcSocketName } from './_types'

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
  register(moduleName, ['websocket'])

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
