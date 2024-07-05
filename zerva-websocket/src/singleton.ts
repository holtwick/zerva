import type { LoggerInterface } from 'zeed'

/** Make sure the flag is only in use once globally. */
export function useSingletonFlag(name: string, log?: LoggerInterface) {
  const _global = globalThis as any
  if (_global._zerva_singleton_flags == null)
    _global._zerva_singleton_flags = {}

  if (_global._zerva_singleton_flags[name] === true) {
    const msg = `Singleton named '${name}' called twice!`
    log?.error(msg)
    throw new Error(msg)
  }

  _global._zerva_singleton_flags[name] = true

  return () => {
    if (_global._zerva_singleton_flags[name] !== true) {
      const msg = `Singleton named '${name}' has been disposed more than once!`
      log?.error(msg)
      throw new Error(msg)
    }
    _global._zerva_singleton_flags[name] = false
  }
}
