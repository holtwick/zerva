import { emit, on, register } from '@zerva/core'
import { cloneObject, Logger } from 'zeed'
import '@zerva/http'

const log = Logger('counter')

declare global {
  interface ZContextEvents {
    counterIncrement: (counter: number) => void
  }
}

export function useCounter() {
  log.info('use counter')
  register('counter', ['http'])
  let counter = 0
  on('httpInit', ({ onGET }) => {
    onGET(['/', '/tick'], async () => {
      await emit('counterIncrement', ++counter)
      return `<div>Counter ${counter}.<br><br>Reload page to increase counter.</div>`
    })
    onGET('/demo.json', async ({ req }) => {
      await emit('counterIncrement', ++counter)
      return {
        headers: cloneObject(req.headers),
        url: req.url,
        ip: req.ip,
        query: req.query,
      }
    })
    onGET('/demo.txt', async () => {
      await emit('counterIncrement', ++counter)
      return `Counter ${counter}`
    })
  })
}
