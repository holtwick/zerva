import { emit, on } from '@zerva/core'
import { cloneObject } from 'zeed'
import { registerModule } from '../../../../zerva-core/src/register'

declare global {
  interface ZContextEvents {
    counterIncrement: (counter: number) => void
  }
}

export function useCounter() {
  const { log } = registerModule('counter', {
    requires: ['http'],
  })

  log('Counter module initialized')

  let counter = 0

  on('httpInit', ({ get }) => {
    get('/counter', async () => {
      await emit('counterIncrement', ++counter)
      return `<div>Counter ${counter}.<br><br>Reload page to increase counter.</div>`
    })
    get('/demo.json', async ({ req }) => {
      await emit('counterIncrement', ++counter)
      return {
        headers: cloneObject(req.headers),
        url: req.url,
        ip: req.ip,
        query: req.query,
      }
    })
    get('/demo.txt', async () => {
      await emit('counterIncrement', ++counter)
      return `Counter ${counter}`
    })
  })
}
