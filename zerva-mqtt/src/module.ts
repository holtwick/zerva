import type { LogConfig } from 'zeed'
import { use } from '@zerva/core'
import { connect } from 'mqtt'
import { z } from 'zeed'

declare global {
  interface ZContextEvents {
    mqttPublish: (topic: string, message: string) => Promise<void>
  }
}

const configSchema = z.object({
  log: z.any<LogConfig>().optional(),
  url: z.string().meta({ desc: 'MQTT broker URL, e.g. "mqtt://localhost"' }),
  port: z.number().optional().meta({ desc: 'MQTT broker port (optional)' }),
  username: z.string().optional().meta({ desc: 'Username for MQTT authentication (optional)' }),
  password: z.string().optional().meta({ desc: 'Password for MQTT authentication (optional)' }),
})

export const useVite = use({
  name: 'vite',
  requires: ['http'],
  configSchema,
  setup({ config, on }) {
    const mqttClient = connect(config.url, {
      username: config.username ?? 'admin',
      password: config.password ?? 'password',
      port: +(config.port ?? 1883),
    })

    on('mqttPublish', async (topic, message) => {
      mqttClient.publish(topic, message)
    })
  },
})
