// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { on, serve, serveStop, setContext } from '@zerva/core'
import { useHttp } from '@zerva/http'
import type { MessageDefinitions } from 'zeed'
import { Logger, createPromise, useMessageHub, uuid } from 'zeed'
import { useWebsocketRpcHub } from './server'

const log = Logger('test:module')

const port = 8889
const url = `ws://localhost:${port}${webSocketPath}`

interface WebsocketActions extends MessageDefinitions {
  echo: (value: any) => Promise<any>
  throwsError: () => Promise<void>
}

describe('rpc', () => {
  beforeAll(async () => {
    setContext() // Avoid conflict of multiple registration

    useHttp({ port })
    useWebsocketRpcHub()

    const [promise, resolve] = createPromise()
    on('httpRunning', resolve)
    await serve()

    await promise
  })

  afterAll(serveStop)

  it('should connect and send stuff', async () => {
    expect.assertions(2)

    // const bridge = useMessageHub({ channel }).send<WebsocketActions>()

    // const id = uuid()
    // const result = await bridge.echo({ id })
    // log('result', result)
    // expect(result).toEqual({ id })

    // try {
    //   await bridge.throwsError()
    // }
    // catch (err) {
    //   expect(err.message).toBe('fakeError')
    // }

    // channel.dispose()
  })
})
