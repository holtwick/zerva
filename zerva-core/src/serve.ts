// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { Logger } from 'zeed'
import { emit, on } from './context'

const log = Logger('zerva:serve')

declare global {
  interface ZContextEvents {
    serveInit(): void
    serveStart(): void
    serveStop(): void
  }
}

// todo context sensitive?
let serverStarted = false
let serverRunning = false

// Shortcuts

export function onInit(handler: () => void) {
  on('serveInit', handler)
}

export function onStart(handler: () => void) {
  on('serveStart', handler)
}

export function onStop(handler: () => void) {
  on('serveStop', handler)
}

export async function serveStop() {
  if (serverRunning) {
    serverRunning = false
    await emit('serveStop')
  }
}

on('serveStart', () => serverRunning = true)
on('serveStop', () => serverRunning = false)

/**
 * A simple context to serve modules. Most modules listen to the evnts emitted by it.
 *
 * @param fn Call your modules in here to add them to the context
 */
export async function serve(fn?: () => void) {
  log('serve')
  serverStarted = true

  if (fn) {
    log('launch')
    fn()
  }
  log('init')
  await emit('serveInit')
  log('start')
  await emit('serveStart')
  log('serve')
}

async function serverCheck() {
  if (serverStarted !== true) {
    log.info('Zerva has not been started manually, will start now!')
    void serve()
  }
  else if (serverRunning === true) {
    log('Reached the end, will finish gracefully.')
    await serveStop()
  }
}

process.on('beforeExit', serverCheck)
// process.on('exit', serveStop)

// Graceful exit

// NOTE: although it is tempting, the SIGKILL signal (9) cannot be intercepted and handled
const signals: any = {
  SIGHUP: 1,
  SIGINT: 2,
  SIGTERM: 15,
}

let isPerformingExit = false

Object.keys(signals).forEach((signal) => {
  process.on(signal, () => {
    if (!isPerformingExit) {
      isPerformingExit = true
      log(`Process received a ${signal} signal`)
      serveStop().then(() => {
        // process.exit(128 + (+signals[signal] ?? 0))
      }).catch((err) => {
        log.error(`Error on srveStop: ${err}`)
      })
    }
    else {
      log(`Ignoring: Process received a ${signal} signal`)
    }
  })
})
