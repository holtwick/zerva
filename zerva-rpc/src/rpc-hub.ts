import { decodeJson, encodeJson, LoggerFromConfig, LogLevelInfo, useRPCHub } from 'zeed'
import type { Channel, LogConfig } from 'zeed'

/** Generic RPC through a channel. */
export function createRPCHub(channel: Channel, logConfig: LogConfig, exceptions = false) {
  const log = LoggerFromConfig(logConfig, 'rpc-hub', LogLevelInfo)
  return useRPCHub({
    log,
    exceptions,
    // onlyEvents: true,
    post: (data: any) => {
      try {
        channel.postMessage(data)
      }
      catch (err) {
        log.warn('rpc postMessage', err, data)
      }
    },
    on: (handler: any) => channel.on('message', (msg) => {
      try {
        return handler(msg.data)
      }
      catch (err) {
        log.warn('rpc channel.on', err, msg.data)
      }
    }),
    serialize: (data: any) => {
      const info = encodeJson(data)
      // log('rpc out', data)
      return info
    },
    deserialize: (data: any) => {
      const info = decodeJson(data)
      // log('rpc in', info)
      return info
    },
  })
}
