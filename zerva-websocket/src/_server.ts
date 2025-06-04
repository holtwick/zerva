import type { Infer, LogConfig } from 'zeed'
import { z } from 'zeed'
import { websocketName } from './_types'

declare module 'ws' {
  interface WebSocket {
    isAlive?: boolean
  }
}

export const moduleName = 'websocket'

export const configSchema = z.object({
  log: z.any<LogConfig>().optional().props({ desc: 'Logging configuration' }),
  debug: z.boolean().default(false).props({ desc: 'Enable debug logging for websocket server.' }),
  name: z.string().default(websocketName).props({ desc: 'Name of the websocket server instance.' }),
  path: z.string().optional().props({ desc: 'URL path for websocket connections.' }),
  pingInterval: z.number().default(30000).props({ desc: 'Interval in milliseconds for sending ping messages.' }),
})

export type ZWebSocketConfig = Infer<typeof configSchema>
