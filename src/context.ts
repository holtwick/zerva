// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { Emitter, Logger, LogLevel, uname } from "zeed"

const log = Logger(`zerva:context`)
log.level = LogLevel.warn

// Others would probably call it "hub" or "bus"...

declare global {
  interface ZContextEvents {
    close(): void
  }
}

export class ZContext extends Emitter<ZContextEvents> {
  name: string = uname("context")
  modules: string[] = []
  // config: any
}

// Global logger to guarantee all submodules use the same logger instance

var context = new ZContext()

interface LoggerGlobal {
  _zervaGlobalContext?: ZContext
}

function getGlobal(): LoggerGlobal {
  if (typeof self !== "undefined") return self as LoggerGlobal
  if (typeof window !== "undefined") return window as LoggerGlobal
  if (typeof global !== "undefined") return global as LoggerGlobal
  if (typeof globalThis !== "undefined") return globalThis as LoggerGlobal
  throw new Error("unable to locate global object")
}

export let setContext = (newContext?: ZContext): void => {
  context = newContext || new ZContext()
}

export let getContext = (): ZContext => context

try {
  let _global = getGlobal()
  if (_global != null) {
    if (_global?._zervaGlobalContext == null) {
      _global._zervaGlobalContext = context
    } else {
      context = _global._zervaGlobalContext
    }
    setContext = (newContext?: ZContext) => {
      let context = newContext || new ZContext()
      log("set context", context.name)
      _global._zervaGlobalContext = context
    }
    getContext = (): ZContext => _global._zervaGlobalContext as ZContext
  }
} catch (e) {
  log.warn("Unable to register Zerva Context globally")
}

/** Emit via the current global context */
export async function emit<U extends keyof ZContextEvents>(
  event: U,
  ...args: Parameters<ZContextEvents[U]>
): Promise<boolean> {
  return await getContext().emit(event, ...args)
}

/** Listener that binds to the current global context */
export function on<U extends keyof ZContextEvents>(
  event: U,
  listener: ZContextEvents[U]
): {
  cleanup: () => void
} {
  return getContext().on(event, listener)
}

/**
 * Check existance of registered module.
 *
 * @param module Name of module
 * @param strict Log error if check fails
 * @returns `true` if `module` has been registered before
 */
export function hasModule(module: string, strict: boolean = false): boolean {
  const has = getContext().modules.includes(module.toLowerCase())
  if (strict && !has) {
    log.error(`module '${module}' is missing`)
  }
  return has
}

/**
 * Check existance of registered modules, log error if missing.
 */
export function requireModules(modules: string[]): boolean {
  return !modules.map((module) => hasModule(module, true)).some((ok) => !ok)
}

/**
 * Register module by name and check for modules it depends on
 *
 * @param moduleName Module name to register
 * @param dependencies List of modules names that have to be registered before in this context
 */
export function register(
  moduleName: string,
  dependencies: string[] = []
): boolean {
  moduleName = moduleName.toLowerCase()
  log(
    `register ${moduleName} ${
      dependencies.length ? `with dependencies=${dependencies}` : ""
    }`
  )

  if (hasModule(moduleName)) {
    log.warn(`The module '${moduleName} has been registered multiple times`)
  }

  getContext().modules.push(moduleName)

  return requireModules(dependencies)
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
  handler: (context?: ZContext) => void
) {
  let previousContext = getContext()
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
