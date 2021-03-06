// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import "cross-fetch/polyfill"
import { httpGetHandler, httpInterface } from "."
import { on } from "../context"
import { emit, serve, useHttp } from "../index"

const port = 8888
const url = `http://localhost:${port}`

describe("http", () => {
  beforeAll(async () => {
    useHttp({ port })

    on("httpInit", (info) => {
      const { get } = info as httpInterface
      get("/test2", (info2) => {
        const { req } = info2
        req.protocol = "xxx"
      })
    })

    on("httpInit", ({ get, addStatic }) => {
      // get("/test", ({ req }) => {
      //   req.protocol
      // })
      get("/hello", "Hello World")
      get("/json", { itIs: "json", v: 1 })
      get("/test2", ({ req }) => {
        req.protocol = "xxx"
      })
      addStatic("/", __dirname)
    })

    await serve()
  })

  afterAll(async () => {
    await emit("serveStop")
  })

  it("should connect typed", async () => {
    expect(await (await fetch(`${url}/hello`)).text()).toEqual("Hello World")
    expect(await (await fetch(`${url}/json`)).json()).toEqual({
      itIs: "json",
      v: 1,
    })
    expect(await (await fetch(`${url}/index.ts`)).text())
      .toMatchInlineSnapshot(`
    "// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.
    
    export * from \\"./exit\\"
    export * from \\"./http\\"
    export * from \\"./qrcode\\"
    "
    `)
  })
})
