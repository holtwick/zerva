import { Logger, cloneObject, emit, on, register } from '@zerva/core'

const log = Logger('counter')

declare global {
  interface ZContextEvents {
    counterIncrement(counter: number): void
  }
}

export function useCounter() {
  log.info('use counter')
  register('counter', ['http'])
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
