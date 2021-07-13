import { emit } from "./context.js"
import { Logger } from "zeed"

const log = Logger(`zerva:serve`)

declare global {
  interface ZContextEvents {
    serveInit(): void
    serveStart(): void
  }
}

/**
 * A simple context to serve modules. Most modules listen to the evnts emitted by it.
 *
 * @param fn Call your modules in here to add them to the context
 */
export async function serve(fn?: () => void) {
  if (fn) {
    log.info("launch")
    fn()
  }
  log.info("init")
  await emit("serveInit")
  log.info("start")
  await emit("serveStart")
  log.info("serve")
}
