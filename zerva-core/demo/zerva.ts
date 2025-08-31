import type { LoggerInterface } from 'zeed'
import { Logger, sleep } from 'zeed'
import { on, serve } from '../src'

const log: LoggerInterface = Logger('demo')

log('demo')

let ctr = 0

on('serveStart', async () => {
  log('start')

  function next() {
    setTimeout(() => {
      log('do ...', ++ctr)
      if (ctr < 3)
        next()
      // else
      //   serveStop(1)
    }, 1000)
  }

  next()
})

on('serveStop', async () => {
  log('stop')
  await sleep(2000)
  log('stop done')
})

void serve()
