import { Logger } from 'zeed'
import * as zz from '@zerva/core'
import { useHttp } from '@zerva/http'

const log = Logger('sandbox')

declare global {
  interface ZContextEvents {
    counterInc: (up: number) => number
  }
}

function useCounter() {
  zz.register('counter', ['http'])
  let counter = 1

  zz.on({
    counterInc(up) {
      log('counterInc', up)
      return (counter += up)
    },
    httpInit({ get }) {
      get('/', ({ req }) => {
        log('get', req.path)
        return `<div>Counter ${counter++}.<br><br>Reload page to increase counter. </div>`
      })
    },
  })

  return {
    getCounter: () => counter,
  }
}

useHttp({
  host: '0.0.0.0',
  port: 3333,
})

useCounter()

setTimeout(() => {
  zz.zerva.call.counterInc(100)
}, 5e3)

// We start the server manually, it would only start automatically
// after all timeouts have finished and that would not be great

void zz.serve()
