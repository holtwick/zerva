import { emit, on } from '@zerva/core'
import { useWebSocket } from '@zerva/websocket'
import { LoggerFromConfig, LogLevelInfo, useDisposeWithUtils } from 'zeed'
import type { Channel, LogConfig, UseDisposeWithUtils, useRPCHub } from 'zeed'
import { rpcSocketName } from './_types'
import { createRPCHub } from './rpc-hub'

const moduleName = 'websocket:rpc'

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

export function useWebsocketRpcHub(config: {
  name?: string
  log?: LogConfig
  exceptions?: boolean
} = {}) {
  const log = LoggerFromConfig(config.log, moduleName, LogLevelInfo)

  log.info(`use ${moduleName}`)

  const {
    name: rpcName = rpcSocketName,
    exceptions,
  } = config

  log(`name=${rpcName}`)

  useWebSocket({
    name: rpcName,
    log: config.log,
  })

  on('webSocketConnect', async ({ channel, name }) => {
    if (rpcName == null || name === rpcName) {
      log('webSocketConnect', name)
      const dispose = useDisposeWithUtils(log.label)
      const rpcHub = createRPCHub(channel, config.log, exceptions)
      await emit('rpcConnect', {
        rpcHub,
        dispose,
        channel,
      })
      channel.on('close', dispose)
    }
  })
}
