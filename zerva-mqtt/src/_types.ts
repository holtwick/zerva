export {}

export interface ZMqttConfig {
  url: string
  port?: number
  username?: string
  password?: string
}

declare global {
  interface ZContextEvents {
    mqttPublish: (topic: string, message: string) => Promise<void>
  }
}
