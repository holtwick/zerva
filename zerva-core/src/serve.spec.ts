import { emit, getContext, on, onInit, onStart, onStop, serve, serveStop, setContext } from './index'

describe('serve', () => {
  it('should pass all phases', async () => {
    setContext()

    let initCount = 0

    const obj = {
      init: false,
      start: false,
      stop: false,
    }

    onInit(() => {
      obj.init = true
      initCount += 1
    })

    // Check if multiple calls work
    onInit(() => {
      obj.init = true
      initCount += 1
    })

    onStart(() => {
      obj.start = true
    })
    onStop(() => {
      obj.stop = true
    })

    await serve()

    expect(obj).toMatchInlineSnapshot(`
      {
        "init": true,
        "start": true,
        "stop": false,
      }
    `)

    await serveStop()

    expect(initCount).toBe(2)
    expect(obj).toMatchInlineSnapshot(`
      {
        "init": true,
        "start": true,
        "stop": false,
      }
    `)
  })

  it('should show a warning if event has been added after emit', async () => {
    setContext()

    let called = false

    await emit('test' as any)

    on('test' as any, () => {
      called = true
    })

    expect(called).toBe(false)
    expect(getContext().eventNamesEmitted.test).toBe(true)
  })
})
