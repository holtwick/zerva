import { arrayFlatten, getGlobalContext, Logger, useDispose } from 'zeed'
import type { DisposerFunction } from 'zeed'
import { ZContext } from './types'

const log = Logger('zerva:context')

// Others would probably call it "hub" or "bus"...

// Global logger to guarantee all submodules use the same logger instance

let context = new ZContext()

// eslint-disable-next-line import/no-mutable-exports
export let setContext = (newContext?: ZContext): void => {
  context = newContext || new ZContext()
}

// eslint-disable-next-line import/no-mutable-exports
export let getContext = (): ZContext => context

try {
  const _global = getGlobalContext()
  if (_global?.zerva == null)
    _global.zerva = context
  else
    context = _global.zerva

  setContext = (newContext?: ZContext) => {
    const context = newContext || new ZContext()
    log('set context', context.name)
    _global.zerva = context
  }
  getContext = (): ZContext => _global.zerva as ZContext
}
catch (e) {
  log.warn('Unable to register Zerva Context globally')
}

/** The global context as constant */
export const zerva = context

/** Emit via the current global context */
export async function emit<U extends keyof ZContextEvents>(
  event: U,
  ...args: Parameters<ZContextEvents[U]>
): Promise<boolean> {
  log('emit', event, JSON.stringify(args.map(o => typeof o)))
  const ctx = getContext()
  ctx.eventNamesEmitted[event] = true
  return await ctx.emit(event, ...args)
}

/** Listener that binds to the current global context */
export function on<U extends keyof ZContextEvents>(
  first: Partial<ZContextEvents>
): DisposerFunction // Overload!

export function on<U extends keyof ZContextEvents>(
  first: U,
  listener: ZContextEvents[U]
): DisposerFunction // Overload!

export function on<U extends keyof ZContextEvents>(
  first: Partial<ZContextEvents> | U,
  listener?: ZContextEvents[U],
): DisposerFunction {
  const ctx = getContext()

  // Single
  if (typeof first === 'string' && listener != null) {
    if (ctx.eventNamesEmitted[first])
      log.warn(`Event '${first}' has already been emitted before listener was added`)
    return ctx.on(first, listener)
  }

  // Multiple
  const dispose = useDispose()
  Object.entries(first).forEach(([k, v]) => {
    if (ctx.eventNamesEmitted[k])
      log.warn(`Event '${first}' has already been emitted before listener was added`)
    dispose.add(ctx.on(k as any, v))
  })
  return dispose
}

export function once<U extends keyof ZContextEvents>(
  first: U,
  listener: ZContextEvents[U]
): DisposerFunction // Overload!

export function once<U extends keyof ZContextEvents>(
  first: Partial<ZContextEvents> | U,
  listener?: ZContextEvents[U],
): DisposerFunction {
  const ctx = getContext()

  // Single
  if (typeof first === 'string' && listener != null) {
    if (ctx.eventNamesEmitted[first])
      log.warn(`Event '${first}' has already been emitted before listener was added`)
    return ctx.once(first, listener)
  }

  // Multiple
  const dispose = useDispose()
  Object.entries(first).forEach(([k, v]) => {
    if (ctx.eventNamesEmitted[k])
      log.warn(`Event '${first}' has already been emitted before listener was added`)
    dispose.add(ctx.once(k as any, v))
  })
  return dispose
}

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
 */
export function register(
  moduleName: string,
  ...dependencies: (string | string[])[]
): boolean {
  moduleName = moduleName.toLowerCase()

  const modules = arrayFlatten(dependencies)

  log(
    `register ${moduleName} ${modules.length ? `with dependencies=${modules}` : ''
    }`,
  )

  if (hasModule(moduleName))
    log.warn(`The module '${moduleName} has been registered multiple times`)

  getContext().modules.push(moduleName)

  assertModules(modules)

  // return requireModules(modules)
  return true
}

/**
 * Set a different global context. Restores previous context after execution.
 * This is not async to avoid sideeffects!
 *
 * @param newContext New context
 * @param handler Executed with `newContext` set as global context
 */
export function withContext(
  newContext: ZContext | undefined,
  handler: (context?: ZContext) => void,
) {
  log('withContext')
  const previousContext = getContext()
  setContext(newContext)
  handler(newContext)
  setContext(previousContext)
}

/**
 * Set a different global context. Restores previous context after execution.
 *
 * @param handler Executed with `newContext` set as global context
 */
export function createContext(handler: (context?: ZContext) => void) {
  withContext(undefined, handler)
}
