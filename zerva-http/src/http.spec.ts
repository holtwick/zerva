import { on, serve, serveStop } from '@zerva/core'
import { fetchJson, fetchOptionsFormURLEncoded, fetchOptionsJson, Logger } from 'zeed'
import { useHttp } from './http'

const log = Logger('test-http')

const port = 8888
const url = `http://localhost:${port}`

function middleware(req: any, res: any, next: any) {
  res.set('X-Test', '123')
  next()
}

describe('http', () => {
  beforeAll(async () => {
    useHttp({ port })

    on('httpInit', (info) => {
      const { onGET, onPOST, STATIC } = info
      // get("/test", ({ req }) => {
      //   req.protocol
      // })

      onGET('/hello', middleware, 'Hello World')
      onGET('/json', { itIs: 'json', v: 1 })
      onGET('/test2', ({ req }) => {
        req.protocol = 'xxx'
      })

      onPOST('/data', ({ req }) => {
        log('headers', req.headers)
        log('req', req.body)
        return req.body
      })

      STATIC('/', __dirname)
    })

    await serve()
  })

  afterAll(serveStop)

  it('should connect typed', async () => {
    const res = await fetch(`${url}/hello`)

    expect(await res.text()).toEqual('Hello World')
    expect(res.headers.get('X-Test')).toEqual('123')

    expect(await (await fetch(`${url}/json`)).json()).toEqual({
      itIs: 'json',
      v: 1,
    })

    expect(
      (await (await fetch(`${url}/index.ts`)).text()).split('\n')[0],
    ).toMatchInlineSnapshot(

      `"export * from './http'"`)

    // Json
    expect(
      await fetchJson(
        `${url}/data`,
        fetchOptionsJson({ hello: 'world' }, 'POST'),
      ),
    ).toEqual({
      hello: 'world',
    })

    // Classic form
    expect(
      await fetchJson(
        `${url}/data`,
        fetchOptionsFormURLEncoded({ hello: 'world' }, 'POST'),
      ),
    ).toEqual({
      hello: 'world',
    })

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
    expect(data[0]).toBe(1)
    expect(data).toMatchInlineSnapshot(`
      Uint8Array [
        1,
        2,
        3,
      ]
    `)
  })
})
