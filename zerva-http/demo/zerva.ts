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

on('httpInit', ({ onGET, STATIC, app }) => {
  onGET('/', `Hello world ${uuid()}`).description('Simple hello world')
  onGET('/json', { hello: 'world', id: uuid() }).description('Simple json response')
  STATIC('/static', process.cwd())
  app.use((req, res, next) => {
    res.setHeader('X-Custom', 'foobar')
    next()
  })
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
