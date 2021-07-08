import { Emitter, Logger } from "zeed"

const log = Logger(`zerva:context`)

// Others would probably call it "hub" or "bus"...

export interface ZConnectInfo {
  type: "http" | "https" | "socket"
}

export interface ZContextEvents {
  connect(info: ZConnectInfo): void
  close(): void
  didAllInit(): void
  didAllSetup(): void
}

export class ZContext extends Emitter<ZContextEvents> {
  config: any
  modules: string[] = []
}

/** The global context */
export var context = new ZContext()

/** Emit via the current global context */
export async function emit<U extends keyof ZContextEvents>(
  event: U,
  ...args: Parameters<ZContextEvents[U]>
): Promise<boolean> {
  return await context.emit(event, ...args)
}

/** Listener that binds to the current global context */
export function on<U extends keyof ZContextEvents>(
  event: U,
  listener: ZContextEvents[U]
): {
  cleanup: () => void
} {
  return context.on(event, listener)
}

/** Register module by name and check for modules it depends on */
export function register(moduleName: string, dependencies: string[] = []) {
  log(
    `register ${moduleName} ${
      dependencies.length ? `with dependencies=${dependencies}` : ""
    }`
  )
  for (const dep of dependencies) {
    if (!context.modules.some((m) => m === dep)) {
      log.error(
        `module ${moduleName} depends on ${dependencies}. ${dep} was not found.`
      )
      throw new Error(
        `module ${moduleName} depends on ${dependencies}. ${dep} was not found.`
      )
    }
  }
  context.modules.push(moduleName)
}

/** Could be a nice counter part to `register`, which gets helpers and checks dependency: const { get } = use('http') */
export function use(name: string): any {} // todo

/** Set a different global context */
export function withContext(newContext: ZContext, handler: () => void) {
  // todo
  let previousContext = context
  context = newContext
  handler()
  context = previousContext
}
