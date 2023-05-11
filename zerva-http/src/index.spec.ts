// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { emit, fetchJson, fetchOptionsFormURLEncoded, fetchOptionsJson, on, serve } from '@zerva/core'
import 'cross-fetch/polyfill'
import { Logger } from 'zeed'
import { useHttp } from '.'

const log = Logger('test-http')

const port = 8888
const url = `http://localhost:${port}`

describe('http', () => {
  beforeAll(async () => {
    useHttp({ port })

    on('httpInit', ({ get, post, addStatic }) => {
      // get("/test", ({ req }) => {
      //   req.protocol
      // })

      function middleware(req: any, res: any, next: any) {
        res.set('X-Test', '123')
      }

      get('/hello', middleware, 'Hello World')
      get('/json', { itIs: 'json', v: 1 })
      get('/test2', ({ req }) => {
        req.protocol = 'xxx'
      })

      post('/data', ({ req }) => {
        log('headers', req.headers)
        log('req', req.body)
        return req.body
      })

      addStatic('/', __dirname)
    })

    await serve()
  })

  afterAll(async () => {
    await emit('serveStop')
  })

  it('should connect typed', async () => {
    const res = await fetch(`${url}/hello`)

    expect(await res.text()).toEqual('Hello World')
    // expect(res.headers.get('X-Test')).toEqual('123')

    expect(await (await fetch(`${url}/json`)).json()).toEqual({
      itIs: 'json',
      v: 1,
    })

    expect(
      (await (await fetch(`${url}/index.ts`)).text()).split('\n')[0],
    ).toEqual(
      '// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.',
    )

    // Json
    expect(
      await fetchJson(
        `${url}/data`,
        fetchOptionsJson({ hello: 'world' }, 'POST'),
      ),
    ).toMatchInlineSnapshot(`
      {
        "hello": "world",
      }
    `)

    // Classic form
    expect(
      await fetchJson(
        `${url}/data`,
        fetchOptionsFormURLEncoded({ hello: 'world' }, 'POST'),
      ),
    ).toMatchInlineSnapshot(`
      {
        "hello": "world",
      }
    `)

    // Binary
    const bin = new Uint8Array([1, 2, 3])
    const result = await fetch(`${url}/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: bin,
    })

    const buffer = await result.arrayBuffer()
    const data = new Uint8Array(buffer)
    expect(data).toMatchInlineSnapshot(`
      Uint8Array [
        1,
        2,
        3,
      ]
    `)
  })
})
