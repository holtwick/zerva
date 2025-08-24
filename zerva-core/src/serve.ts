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

enum ServerState {
  IDLE = 'idle',
  STARTED = 'started',
  RUNNING = 'running',
  STOPPING = 'stopping',
  DISPOSED = 'disposed',
}

export { ServerState }

// todo context sensitive?
let serverState = ServerState.IDLE

/** Get the current server state (mainly for testing) */
export function getServerState(): ServerState {
  return serverState
}

/** Reset the server state to IDLE (mainly for testing) */
export function resetServerState(): void {
  serverState = ServerState.IDLE
}

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
  if (serverState === ServerState.STOPPING) {
    await new Promise(resolve => getContext().once('serveDispose', () => resolve(true)))
  }
  else if (serverState === ServerState.RUNNING) {
    serverState = ServerState.STOPPING
    await emit('serveStop')
    serverState = ServerState.DISPOSED
    await emit('serveDispose')
  }
  // log('serveStop done')
}

on('serveStop', () => {
  if (serverState !== ServerState.STOPPING) {
    // throw new Error('You should call `serveStop` instead of emitting `serveStop`!')
    log.warn('You should call `serveStop()` function instead of directly emitting `serveStop` event!')

    // eslint-disable-next-line no-console
    console.trace()
  }
})

/**
 * A simple context to serve modules. Most modules listen to the events emitted by it.
 *
 * @param fn Call your modules in here to add them to the context
 */
export async function serve(fn?: () => void) {
  log('serve')

  // Only start if we're in IDLE state
  if (serverState !== ServerState.IDLE) {
    log.warn(`Server is already in state: ${serverState}, ignoring serve() call`)
    return
  }

  serverState = ServerState.STARTED

  if (fn) {
    log('launch')
    fn()
  }
  log('init')
  await emit('serveInit')
  log('start')
  await emit('serveStart')
  // Set state to RUNNING after serveStart event is emitted
  serverState = ServerState.RUNNING
  log('serve')
}

async function serverCheck() {
  if (serverState === ServerState.IDLE) {
    log.info('Zerva has not been started manually, will start now!')
    void serve()
  }
  else if (serverState === ServerState.RUNNING) {
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
