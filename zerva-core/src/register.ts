import type { Infer, LoggerInterface, LogLevel, Type } from 'zeed'
import type { ZervaConfigOptions } from './config'
import { arrayFlatten, Logger, LoggerFromConfig, LogLevelAll, LogLevelInfo, z } from 'zeed'
import { getConfig } from './config'
import { getContext } from './context'

const log: LoggerInterface = Logger('zerva:register')

/**
 * Check existance of registered module.
 *
 * @param module Name of module
 * @param strict Log error if check fails
 * @returns `true` if `module` has been registered before
 */
export function hasModule(module: string, strict = false): boolean {
  const has = getContext().modules.includes(module.toLowerCase())
  // log(`hasModule ${module} => ${has} (strict=${strict})`)
  if (strict && !has)
    log.error(`module '${module}' is missing`)
  return has
}

/**
 * Check existance of registered modules, log error if missing.
 */
export function requireModules(
  ...requiredModules: (string | string[])[]
): boolean {
  const modules = arrayFlatten(requiredModules)
  return !modules.map(module => hasModule(module, true)).some(ok => !ok)
}

export function assertModules(...requiredModules: (string | string[])[]): void {
  const modules = arrayFlatten(requiredModules)
  const missing = modules.filter(module => !hasModule(module))
  if (missing.length > 0) {
    log.error(`Zerva modules required: ${missing}`)
    throw new Error(`Zerva modules required: ${missing}`)
  }
}

/**
 * Register module by name and check for modules it depends on
 *
 * @param moduleName Module name to register
 * @param dependencies List of modules names that have to be registered before in this context
 * @deprecation Use `registerModule` instead
 */
export function register(
  moduleName: string,
  ...dependencies: (string | string[])[]
): boolean {
  moduleName = moduleName.toLowerCase()
  const modules = arrayFlatten(dependencies)
  log(`register ${moduleName} ${modules.length ? `with dependencies=${modules}` : ''}`)
  if (hasModule(moduleName))
    log.warn(`The module '${moduleName} has been registered multiple times`)
  getContext().modules.push(moduleName)
  assertModules(modules)
  return true
}

export interface ZervaModuleOptions<T> {
  requires?: string[] | string
  configSchema?: T
  configOptions?: ZervaConfigOptions
  options?: Partial<Infer<T>>
  logLevel?: LogLevel
}

/**
 * Register a module with its configuration and dependencies.
 *
 * This function registers a module by its name, checks for required modules,
 * and retrieves its configuration based on the provided schema.
 *
 * It also initializes a logger for the module, where log details can be customized.
 * If `configSchema.log` is of type `LogConfig` the logger will be created from it.
 *
 * `options` can be used to override the default configuration values i.e. first
 * apply `options` and then the `configSchema` values.
 *
 * @param name Name of the module to register
 * @param options Additional options for the module
 * @returns { name: string, config: Infer<T>, log: LoggerInterface }
 */
export function registerModule<T extends Type<unknown> = Type<any>>(name: string, options?: ZervaModuleOptions<T>): {
  name: string
  config: Infer<T>
  log: LoggerInterface
} {
  const { requires = [], configOptions, configSchema } = options || {}

  // Module name
  const moduleName = name.toLowerCase()

  // Config and options
  const config: any = { ...options?.options }
  if (configSchema != null) {
    Object.assign(config, getConfig(configSchema, {
      prefix: `${moduleName.toUpperCase()}_`,
      module: moduleName,
      ...configOptions,
    }))
  }

  // Logging
  const log = LoggerFromConfig(config?.log ?? true, moduleName, options?.logLevel ?? LogLevelAll)
  log(`use ${moduleName} with config:`, config)

  // Register module in context
  if (hasModule(moduleName))
    log.warn(`The module '${moduleName} has been registered multiple times`)
  getContext().modules.push(moduleName)

  // Check required modules
  const modules = arrayFlatten(requires)
  const missing = modules.filter(module => !hasModule(module))
  if (missing.length > 0) {
    const message = `Zerva module '${moduleName}' requires modules: ${missing}`
    log.error(message)
    throw new Error(message)
  }

  return { name: moduleName, log, config }
}
