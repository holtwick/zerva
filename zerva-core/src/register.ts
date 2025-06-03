import type { Infer, LoggerInterface, Type } from 'zeed'
import type { ZervaConfigOptions } from './config'
import { arrayFlatten, Logger, z } from 'zeed'
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
  log(`hasModule ${module} => ${has} (strict=${strict})`)
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
}

export function registerModule<T extends Type<unknown>>(name: string, options?: ZervaModuleOptions<T>): { name: string, config: Infer<T> } {
  const { requires = [], configOptions, configSchema } = options || {}
  register(name, requires)
  let config: any
  if (configSchema != null) {
    config = getConfig(configSchema, {
      prefix: `${name.toUpperCase()}_`,
      ...configOptions,
    })
  }
  return { name, config }
}
