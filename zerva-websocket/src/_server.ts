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
  log: z.any<LogConfig>().optional().meta({ desc: 'Logging configuration' }),
  debug: z.boolean().default(false).meta({ desc: 'Enable debug logging for websocket server.' }),
  name: z.string().default(websocketName).meta({ desc: 'Name of the websocket server instance.' }),
  path: z.string().optional().meta({ desc: 'URL path for websocket connections.' }),
  pingInterval: z.number().default(30000).meta({ desc: 'Interval in milliseconds for sending ping messages.' }),
})

export type ZWebSocketConfig = Infer<typeof configSchema>
