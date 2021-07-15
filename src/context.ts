import { Emitter, Logger } from "zeed"

const log = Logger(`zerva:context`)

// Others would probably call it "hub" or "bus"...

declare global {
  interface ZContextEvents {
    close(): void
  }
}

export class ZContext extends Emitter<ZContextEvents> {
  // config: any
  modules: string[] = []
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

let setContext = (newContext: ZContext): void => {
  context = newContext
}

let getContext = (): ZContext => context

try {
  let _global = getGlobal()
  if (_global != null) {
    if (_global?._zervaGlobalContext == null) {
      _global._zervaGlobalContext = context
    } else {
      context = _global._zervaGlobalContext
    }
    setContext = (newContext: ZContext) => {
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
 * Register module by name and check for modules it depends on
 *
 * @param moduleName Module name to register
 * @param dependencies List of modules names that have to be registered before in this context
 */
export function register(moduleName: string, dependencies: string[] = []) {
  moduleName = moduleName.toLowerCase()
  log(
    `register ${moduleName} ${
      dependencies.length ? `with dependencies=${dependencies}` : ""
    }`
  )
  dependencies.forEach((module) => hasModule(module, true))
  getContext().modules.push(moduleName)
}

/**
 * Set a different global context. Restores previous context after execution.
 *
 * @param newContext New context
 * @param handler Executed with `newContext` set as global context
 */
export function withContext(newContext: ZContext, handler: () => void) {
  let previousContext = getContext()
  setContext(newContext)
  handler()
  setContext(previousContext)
}
