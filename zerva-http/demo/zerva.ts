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
  app.use((req, res, next) => {
    log('set x-custom header for', req.url)
    res.setHeader('X-Custom', 'foobar')
    next()
  })

  onGET('/', `<body>
  <h1>Hello World</h1>
  <p>This is a demo of zerva-http.</p>
  <pre>Loading...</pre> 
  <script>
  fetch('/json').then(r => r.json()).then(r => {
    console.log('json', r)
    document.querySelector('pre').textContent = JSON.stringify(r, null, 2)
  })
  </script>
</body>`).description('Simple hello world')
  onGET('/json', { hello: 'world', id: uuid() }).description('Simple json response')
  STATIC('/static', process.cwd())
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
