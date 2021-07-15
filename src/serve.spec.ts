// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import {
  on,
  emit,
  register,
  hasModule,
  requireModules,
  withContext,
  ZContext,
  getContext,
  setContext,
  createContext,
  onInit,
  onStart,
  onStop,
  serve,
  serveStop,
} from "./index"

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
