import type { LoggerInterface } from 'zeed'
import { Logger, sleep } from 'zeed'
import { onStart, onStop, serve } from '../src'

const log: LoggerInterface = Logger('demo')

log('demo')

onStart(() => {
  log('start')
  setInterval(() => log('do ...'), 1000)
})

onStop(async () => {
  log('stop')
  await sleep(1000)
  log('stop done')
})

serve()
