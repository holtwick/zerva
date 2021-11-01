// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { emit, on } from "./context"
import { getGlobalContext, Logger } from "zeed"

const log = Logger(`zerva:serve`)

declare global {
  interface ZContextEvents {
    serveInit(): void
    serveStart(): void
    serveStop(): void
  }
  interface ZeedGlobalContext {
    checkServeTimeout: any
  }
}

// Shortcuts

export function onInit(handler: () => void) {
  on("serveInit", handler)
}

export function onStart(handler: () => void) {
  on("serveStart", handler)
}

export function onStop(handler: () => void) {
  on("serveStop", handler)
}

export async function serveStop() {
  await emit("serveStop")
}

// Security net

if (!getGlobalContext().checkServeTimeout) {
  getGlobalContext().checkServeTimeout = setTimeout(() => {
    console.info(
      "\n\n*** Did you probably forget to call serve() from Zerva to get it all started? ***\n\n"
    )
  }, 5000)
  log("start waiting 5s until serve() is called")
}

/**
 * A simple context to serve modules. Most modules listen to the evnts emitted by it.
 *
 * @param fn Call your modules in here to add them to the context
 */
export async function serve(fn?: () => void) {
  log("serve")

  if (getGlobalContext().checkServeTimeout) {
    clearTimeout(getGlobalContext().checkServeTimeout)
    getGlobalContext().checkServeTimeout = undefined
  }

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
