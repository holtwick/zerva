// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { onInit, onStart, onStop, serve, serveStop, setContext } from './index'

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
})
