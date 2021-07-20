// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { onInit, onStart, onStop, serve, serveStop, setContext } from "./index"

describe("serve", () => {
  it("should pass all phases", async () => {
    setContext()

    let obj = {
      init: false,
      start: false,
      stop: false,
    }

    onInit(() => {
      obj.init = true
    })
    onStart(() => {
      obj.start = true
    })
    onStop(() => {
      obj.stop = true
    })

    await serve()

    expect(obj).toMatchInlineSnapshot(`
Object {
  "init": true,
  "start": true,
  "stop": false,
}
`)

    await serveStop()

    expect(obj).toMatchInlineSnapshot(`
Object {
  "init": true,
  "start": true,
  "stop": true,
}
`)
  })
})
