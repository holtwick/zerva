/* eslint-disable node/prefer-global/process */
import type { LoggerInterface } from 'zeed'
import { on, onStart, onStop, serve } from '@zerva/core'
import { Logger, sleep, uuid } from 'zeed'
import { useHttp } from '../src'

process.env.HTTP_LOG = 'demo.log' // fail

const log: LoggerInterface = Logger('demo')

log('demo')

let ctr = 0

useHttp({ helmet: true, cors: true })

on('httpInit', ({ onGET }) => {
  onGET('/', `Hello world ${uuid()}`)
})

onStart(() => {
  log('start')

  function next() {
    setTimeout(() => {
      log('do ...', ++ctr)
      if (ctr < 5)
        next()
      // else
      //   serveStop()
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
