import process from 'node:process'
import { Logger } from 'zeed'
import { emit, getContext, on } from './context'

const log = Logger('zerva:serve')

declare global {
  interface ZContextEvents {
    serveInit: () => void
    serveStart: () => void
    serveStop: () => void
    serveDispose: () => void
  }
}

// todo context sensitive?
let serverStarted = false
let serverRunning = false
let serverStoping = false

// Shortcuts

/** @deprecated use `on('serveInit', handler)` */
export function onInit(handler: () => void) {
  on('serveInit', handler)
}

/** @deprecated use `on('serveStart', handler)` */
export function onStart(handler: () => void) {
  on('serveStart', handler)
}

/** @deprecated use `on('serveStop', handler)` */
export function onStop(handler: () => void) {
  on('serveStop', handler)
}

export async function serveStop() {
  // log('serveStop called')
  if (serverStoping) {
    await new Promise(resolve => getContext().once('serveDispose', () => resolve(true)))
  }
  else if (serverRunning) {
    serverRunning = false
    serverStoping = true
    await emit('serveStop')
    serverStoping = false
    await emit('serveDispose')
  }
  // log('serveStop done')
}

on('serveStart', () => {
  serverRunning = true
})

on('serveStop', () => {
  if (serverStoping !== true) {
    // throw new Error('You should call `serveStop` instead of emitting `serveStop`!')
    log.warn('You should call `serveStop` instead of emitting `serveStop`!')

    // eslint-disable-next-line no-console
    console.trace()
  }
})

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

// on('serveDispose', () => process.exit(0))

Object.keys(signals).forEach((signal) => {
  process.on(signal, () => {
    if (!isPerformingExit) {
      isPerformingExit = true
      log(`Process received a ${signal} signal`)
      serveStop().then(() => {
        // process.exit(128 + (+signals[signal] ?? 0))
        // log('Process EXIT')
        process.exit(0)
      }).catch((err) => {
        log.error(`Error on serveStop: ${err}`)
      })
    }
    else {
      log(`Ignoring: Process received a ${signal} signal`)
    }
  })
})
