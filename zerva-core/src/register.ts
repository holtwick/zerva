import type { Infer, LogConfig, LoggerInterface, LogLevel, Type } from 'zeed'
import type { ZervaConfigOptions } from './config'
import { arrayFlatten, Logger, LoggerFromConfig, LogLevelAll } from 'zeed'
import { getConfig } from './config'
import { emit, getContext, on, once } from './context'

const log: LoggerInterface = Logger('zerva:register')

export function getModuleContext<T extends Type<unknown> = Type<any>>(name: string): ZervaModuleContext<T> | undefined {
  const moduleName = name.toLowerCase()
  const context = getContext()
  if (context.uses[moduleName] != null) {
    return context.uses[moduleName] as ZervaModuleContext<T>
  }
  log.warn(`Module '${moduleName}' not found in context uses`)
  return undefined
}

/**
 * Check existance of registered module.
 *
 * @param name Name of module
 * @param strict Log error if check fails
 * @returns `true` if `module` has been registered before
 */
export function hasModule(name: string, strict = false): boolean {
  const moduleName = name.toLowerCase()
  const has = getContext().modules.includes(moduleName) || getContext().uses[moduleName] != null
  // log(`hasModule ${module} => ${has} (strict=${strict})`)
  if (strict && !has)
    log.error(`module '${name}' is missing`)
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
  name?: string
  description?: string
  url?: string

  requires?: string[] | string

  configSchema?: T
  configOptions?: ZervaConfigOptions<T>
  options?: Partial<Infer<T>>

  log?: LogConfig
  logLevel?: LogLevel
}

export interface ZervaModuleContext<T> {
  name: string
  config: Infer<T>
  moduleOptions?: ZervaModuleOptions<T>
  log: LoggerInterface
  on: typeof on
  once: typeof once
  emit: typeof emit
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
 * @param moduleOptions Additional options for the module
 * @returns { name: string, config: Infer<T>, log: LoggerInterface }
 */
export function registerModule<T extends Type<unknown> = Type<any>>(name: string, moduleOptions?: ZervaModuleOptions<T>): ZervaModuleContext<T> {
  const { requires = [], configOptions, configSchema, options } = moduleOptions || {}

  // Module name
  const moduleName = name.toLowerCase()

  // Config and options
  const config: any = { ...options }
  if (configSchema != null) {
    const configFromSchema = getConfig(configSchema, {
      existing: options as any,
      prefix: `${moduleName.toUpperCase()}_`,
      moduleName,
      ...configOptions,
    })
    Object.assign(config, configFromSchema)
    // Object.entries(configFromSchema as any).forEach(([key, value]) => {
    //   if (value !== undefined) {
    //     config[key] = value
    //   }
    // })
  }

  // Logging
  const log = LoggerFromConfig(config?.log ?? moduleOptions?.log ?? true, moduleName, moduleOptions?.logLevel ?? LogLevelAll)
  log.info(`use ${moduleName} with config:`, config)

  // Register module in context
  if (hasModule(moduleName))
    log.warn(`The module '${moduleName} has been registered multiple times`)

  // Check required modules
  const modules = arrayFlatten(requires)
  const missing = modules.filter(module => !hasModule(module))
  if (missing.length > 0) {
    const message = `Zerva module '${moduleName}' requires modules: ${missing}`
    log.error(message)
    throw new Error(message)
  }

  const context: ZervaModuleContext<T> = { name: moduleName, log, config, on, once, emit, moduleOptions }
  getContext().uses[moduleName] = context
  return context
}

export function use<T extends Type<unknown> = Type<any>, R = any>(
  moduleOptions: ZervaModuleOptions<T> & {
    name: string
    setup: (context: ZervaModuleContext<T>) => R
  },
): (options?: Partial<Infer<T>>) => R {
  return (options) => {
    return moduleOptions.setup(
      registerModule(moduleOptions.name, {
        options,
        ...moduleOptions,
      }))
  }
}
