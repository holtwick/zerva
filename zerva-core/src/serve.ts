// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { nextTick } from "process"
import { Logger } from "zeed"
import { emit, on } from "./context"

const log = Logger(`zerva:serve`)

declare global {
  interface ZContextEvents {
    serveInit(): void
    serveStart(): void
    serveStop(): void
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

let serverStarted = false

/**
 * A simple context to serve modules. Most modules listen to the evnts emitted by it.
 *
 * @param fn Call your modules in here to add them to the context
 */
export async function serve(fn?: () => void) {
  log("serve")
  serverStarted = true

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

function serverCheck() { 
  if (serverStarted !== true) {
    log.info('Zerva has not been started manually, will start now!')
    serve()
  }
}

process.on("beforeExit", serverCheck)
