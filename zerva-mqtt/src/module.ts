import { on, register } from '@zerva/core'
import type { LogConfig } from 'zeed'
import { LogLevelInfo, LoggerFromConfig } from 'zeed'
import { connect } from 'mqtt'
import type { ZMqttConfig } from './_types'

const moduleName = 'mqtt'

export function useMqtt(config: ZMqttConfig & { log?: LogConfig }) {
  const log = LoggerFromConfig(config?.log, moduleName, LogLevelInfo)

  log.info(`use ${moduleName}`)
  register(moduleName)

  const mqttClient = connect(config.url, {
    username: config.username ?? 'admin',
    password: config.password ?? 'password',
    port: +(config.port ?? 1883),
  })

  on('mqttPublish', async (topic, message) => {
    mqttClient.publish(topic, message)
  })
}
