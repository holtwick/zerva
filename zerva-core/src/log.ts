import type { LogLevelAliasType, LoggerInterface } from 'zeed'
import { Logger, isNumber, isString } from 'zeed'

export type LogConfig = LoggerInterface | string | number | null | undefined | boolean

export function LoggerFromConfig(config: LogConfig, name: string, level?: LogLevelAliasType): LoggerInterface {
  if (config === true)
    return Logger(name, level)
  if (isString(config))
    return Logger(config, level)
  if (isNumber(config))
    return Logger(name, config)
  if (typeof config === 'function')
    return config
  return Logger(name, false)
}
