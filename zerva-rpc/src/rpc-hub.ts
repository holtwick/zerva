import type { Channel, LoggerInterface } from 'zeed'
import { Logger, decodeJson, encodeJson, useRPCHub } from 'zeed'

const log: LoggerInterface = Logger('rpc')

/** Generic RPC through a channel. */
export function createRPCHub(channel: Channel) {
  return useRPCHub({
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
