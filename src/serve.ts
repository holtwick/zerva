// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

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

/**
 * A simple context to serve modules. Most modules listen to the evnts emitted by it.
 *
 * @param fn Call your modules in here to add them to the context
 */
export async function serve(fn?: () => void) {
  log("serve")

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
