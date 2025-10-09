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

export type ServerState = 'starting' | 'started' | 'stopping' | 'stopped'

// todo context sensitive?
let serverState: ServerState = 'stopped'

/** Get the current server state (mainly for testing) */
export function getServerState(): ServerState {
  return serverState
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

export async function serveStop(exitCode?: number) {
  // log('serveStop called')
  if (serverState === 'stopping') {
    await new Promise(resolve => getContext().once('serveDispose', () => resolve(true)))
  }
  else if (serverState === 'started') {
    serverState = 'stopping'
    await emit('serveStop')
    serverState = 'stopped'
    await emit('serveDispose')
  }

  // Only exit if an exit code is explicitly provided
  if (exitCode !== undefined) {
    log(`Process will exit with code: ${exitCode}`)

    // Throw an error with the exit code to propagate up and exit naturally
    const error = new Error(`Process termination requested with exit code ${exitCode}`)
    ;(error as any).exitCode = exitCode
    throw error
  }
}

on('serveStop', () => {
  if (serverState === 'stopping' || serverState === 'stopped')
    return

  // throw new Error('You should call `serveStop` instead of emitting `serveStop`!')
  log.warn(`You should call 'serveStop()' function instead of directly emitting 'serveStop' event! Instead got ${serverState}.`)

  // eslint-disable-next-line no-console
  console.trace()
})

/**
 * A simple context to serve modules. Most modules listen to the events emitted by it.
 *
 * @param fn Call your modules in here to add them to the context
 */
export async function serve(fn?: () => void) {
  log('serve')

  // Only start if we're in stopped state
  if (serverState !== 'stopped') {
    log.warn(`Server is already in state: ${serverState}, ignoring serve() call`)
    return
  }

  serverState = 'starting'

  if (fn) {
    log('launch')
    fn()
  }
  log('init')
  await emit('serveInit')
  log('start')
  await emit('serveStart')
  // Set state to started after serveStart event is emitted
  serverState = 'started'
  log('serve')
}

async function serverCheck() {
  if (serverState === 'stopped') {
    log.info('Zerva has not been started manually, will start now!')
    void serve()
  }
  else if (serverState === 'started') {
    log('Reached the end, will finish gracefully.')
    await serveStop()
  }
}

process.on('beforeExit', serverCheck)

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

      if (serverState === 'started') {
        serverState = 'stopping'
        serveStop().then(() => {
          process.exit(0)
        }).catch(() => {
          process.exit(1)
        })
      }
      else {
        process.exit(0)
      }
    }
    else {
      // Multiple signals - force exit
      process.exit(0)
    }
  })
})
