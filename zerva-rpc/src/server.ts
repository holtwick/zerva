import type { Channel, LogConfig, UseDisposeWithUtils, useRPCHub } from 'zeed'
import { use } from '@zerva/core'
import { useWebSocket } from '@zerva/websocket'
import { useDisposeWithUtils, z } from 'zeed'
import { rpcSocketName } from './_types'
import { createRPCHub } from './rpc-hub'

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

export const configSchema = z.object({
  log: z.any<LogConfig>().optional().meta({ desc: 'Logging configuration' }),
  name: z.string().default(rpcSocketName).meta({ desc: 'Name of the RPC hub instance.' }),
  exceptions: z.boolean().default(true).meta({ desc: 'Enable exception handling in the RPC hub.' }),
})

export const useWebsocketRpcHub = use({
  name: 'rpc',
  requires: ['http'],
  configSchema,
  setup({ config, log, on, emit }) {
    const { name: rpcName, exceptions } = config
    useWebSocket({
      name: config.name,
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
  },
})
