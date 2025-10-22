import { on, serve, serveStop } from '@zerva/core'
import { Logger } from 'zeed'
import { useHttp } from './http'

const log = Logger('test-request-headers')

const port = 8889
const url = `http://localhost:${port}`

describe('request handler - header safety', () => {
  beforeAll(async () => {
    useHttp({ port })

    on('httpInit', (info) => {
      const { onGET, onPOST } = info

      // Test 1: Handler calls res.end() and returns a value
      onGET('/handler-ends-and-returns', (_req, res) => {
        res.status(200).send('Handler sent this')
        return 'This should not be sent' // Should trigger warning
      })

      // Test 2: Handler streams with res.write() and returns
      onGET('/handler-streams-and-returns', (_req, res) => {
        res.status(200)
        res.write('Streamed ')
        res.write('content')
        res.end()
        return 'This should not be sent' // Should trigger warning
      })

      // Test 3: Handler returns [status, body] tuple - should work normally
      onGET('/handler-returns-tuple', () => {
        return [201, { created: true }]
      })

      // Test 4: Handler returns numeric status - should work normally
      onGET('/handler-returns-number', () => {
        return 404
      })

      // Test 5: Handler returns string - should work normally
      onGET('/handler-returns-string', () => {
        return 'Hello World'
      })

      // Test 6: Handler returns HTML string - should auto-detect content-type
      onGET('/handler-returns-html', () => {
        return '<html><body>Hello</body></html>'
      })

      // Test 7: Handler with .json suffix returns object
      onGET('/data.json', () => {
        return { format: 'json' }
      })

      // Test 8: Handler calls res.send() and returns nothing - should work
      onGET('/handler-sends-directly', (_req, res) => {
        res.status(200).json({ direct: true })
        // No return - should not trigger warning
      })

      // Test 9: Handler throws error after sending
      onGET('/handler-error-after-send', (_req, res) => {
        res.status(200).send('Sent first')
        throw new Error('Error after send') // Should not try to send 500
      })

      // Test 10: Handler returns null - should send 500
      onGET('/handler-returns-null', () => {
        return null
      })

      // Test 11: POST handler with res.end() and return
      onPOST('/post-handler-ends', (_req, res) => {
        res.status(201).json({ posted: true })
        return { ignored: true } // Should trigger warning
      })

      // Test 12: Handler that streams after async operation
      onGET('/handler-async-stream', async (_req, res) => {
        await new Promise(resolve => setTimeout(resolve, 10))
        res.status(200)
        res.setHeader('Content-Type', 'text/plain')
        res.write('Async ')
        res.write('stream')
        res.end()
        return 'Should not be sent'
      })
    })

    await serve()
  })

  afterAll(() => serveStop())

  it('should handle when handler ends response and returns value', async () => {
    const res = await fetch(`${url}/handler-ends-and-returns`)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Handler sent this')
    // Warning should be logged: "Response already sent by handler"
  })

  it('should handle when handler streams and returns value', async () => {
    const res = await fetch(`${url}/handler-streams-and-returns`)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Streamed content')
    // Warning should be logged: "Response already sent by handler"
  })

  it('should handle tuple [status, body] return correctly', async () => {
    const res = await fetch(`${url}/handler-returns-tuple`)
    expect(res.status).toBe(201)
    expect(await res.json()).toEqual({ created: true })
  })

  it('should handle numeric status return correctly', async () => {
    const res = await fetch(`${url}/handler-returns-number`)
    expect(res.status).toBe(404)
    expect(await res.text()).toBe('404')
  })

  it('should handle string return correctly', async () => {
    const res = await fetch(`${url}/handler-returns-string`)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Hello World')
    expect(res.headers.get('Content-Type')).toContain('text/plain')
  })

  it('should auto-detect HTML content-type', async () => {
    const res = await fetch(`${url}/handler-returns-html`)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('<html><body>Hello</body></html>')
    expect(res.headers.get('Content-Type')).toContain('text/html')
  })

  it('should set content-type from suffix', async () => {
    const res = await fetch(`${url}/data.json`)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ format: 'json' })
    expect(res.headers.get('Content-Type')).toContain('json')
  })

  it('should handle when handler sends directly without return', async () => {
    const res = await fetch(`${url}/handler-sends-directly`)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ direct: true })
    // No warning should be logged
  })

  it('should not send 500 when handler errors after sending', async () => {
    const res = await fetch(`${url}/handler-error-after-send`)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Sent first')
    // Warning should be logged: "Cannot send 500 error response, headers already sent"
  })

  it('should send 500 when handler returns null', async () => {
    const res = await fetch(`${url}/handler-returns-null`)
    expect(res.status).toBe(500)
    expect(await res.text()).toBe('No response')
  })

  it('should handle POST with res.end() and return', async () => {
    const res = await fetch(`${url}/post-handler-ends`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true }),
    })
    expect(res.status).toBe(201)
    expect(await res.json()).toEqual({ posted: true })
    // Warning should be logged
  })

  it('should handle async streaming handler', async () => {
    const res = await fetch(`${url}/handler-async-stream`)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Async stream')
    // Warning should be logged: "Response already sent by handler"
  })
})

describe('request handler - edge cases', () => {
  const testPort = 8890
  const testUrl = `http://localhost:${testPort}`

  beforeAll(async () => {
    useHttp({ port: testPort })

    on('httpInit', (info) => {
      const { onGET } = info

      // Test suffix with headers already sent
      onGET('/suffix-conflict.json', (_req, res) => {
        res.status(200).send({ conflict: true })
        return { ignored: true }
        // Should log: "Cannot set content-type from suffix, headers already sent"
      })

      // Test auto-detect content-type with headers already sent
      onGET('/autodetect-conflict', (_req, res) => {
        res.status(200).send('<html>sent</html>')
        return '<html>ignored</html>'
        // Should log: "Cannot auto-detect content-type, headers already sent"
      })

      // Test tuple status with headers already sent
      onGET('/tuple-conflict', (_req, res) => {
        res.status(200).send('Already sent')
        return [404, 'Not found'] // Status cannot be set
        // Should log: "Cannot set status 404 from tuple, headers already sent"
      })
    })

    await serve()
  })

  afterAll(() => serveStop())

  it('should warn when suffix conflicts with already-sent headers', async () => {
    const res = await fetch(`${testUrl}/suffix-conflict.json`)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ conflict: true })
    // Warning should be logged
  })

  it('should warn when auto-detect conflicts with already-sent headers', async () => {
    const res = await fetch(`${testUrl}/autodetect-conflict`)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('<html>sent</html>')
    // Warning should be logged
  })

  it('should warn when tuple status conflicts with already-sent headers', async () => {
    const res = await fetch(`${testUrl}/tuple-conflict`)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Already sent')
    // Warning should be logged about status
  })
})
