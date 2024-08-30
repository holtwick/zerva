import { on, serve, serveStop, setContext } from '@zerva/core'
import { useHttp } from '@zerva/http'
import { Logger, createPromise, uuid } from 'zeed'
import { useWebsocketRpcHub } from './server'
import { useWebsocketRpcHubClient } from './client'

const log = Logger('test:module')

const port = 8887
const url = `ws://localhost:${port}/rpc`

interface WebsocketActions {
  echo: (value: any) => any
  throwsError: () => void
}

describe('rpc', () => {
  beforeAll(async () => {
    setContext() // Avoid conflict of multiple registration

    useHttp({ port })
    useWebsocketRpcHub({ log: true })

    on('rpcConnect', async ({ rpcHub, dispose }) => {
      const rpc = rpcHub<WebsocketActions, WebsocketActions>({
        echo(value) {
          log('echo', value)
          return value
        },
        throwsError() {
          throw new Error('fakeError')
        },
      })
    })

    const [promise, resolve] = createPromise()
    on('httpRunning', resolve)
    await serve()

    await promise
  })

  afterAll(serveStop)

  it('should connect and send stuff', async () => {
    expect.assertions(1)

    const { rpcHub, dispose, awaitConnection } = useWebsocketRpcHubClient(url)

    const rpc = rpcHub<WebsocketActions>()

    await awaitConnection

    const id = uuid()
    const result = await rpc.echo({ id })
    log('result', result)
    expect(result).toEqual({ id })

    // try {
    //   await rpc.throwsError()
    // }
    // catch (err) {
    //   expect(err.message).toBe('fakeError')
    // }

    await dispose()
  })
})
