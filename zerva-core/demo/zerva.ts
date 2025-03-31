import type { LoggerInterface } from 'zeed'
import { Logger, sleep } from 'zeed'
import { onStart, onStop, serve } from '../src'

const log: LoggerInterface = Logger('demo')

log('demo')

let ctr = 0

onStart(() => {
  log('start')

  function next() {
    setTimeout(() => {
      log('do ...', ++ctr)
      if (ctr < 5)
        next()
    }, 1000)
  }

  next()
})

onStop(async () => {
  log('stop')
  await sleep(2000)
  log('stop done')
})

void serve()
