// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import "cross-fetch/polyfill"
import { Logger, LoggerNodeHandler, LogLevel } from "zeed"
import { on } from "../context"
import { emit, serve, useHttp } from "../index"

Logger.setHandlers([
  LoggerNodeHandler({
    level: LogLevel.info,
    filter: "*",
    colors: true,
    padding: 32,
    nameBrackets: false,
    levelHelper: false,
  }),
])

const port = 8888
const url = `http://localhost:${port}`

describe("http", () => {
  beforeAll(async () => {
    useHttp({ port })

    on("httpInit", ({ get, addStatic }) => {
      get("/hello", "Hello World")
      get("/json", { itIs: "json", v: 1 })
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
    
    export * from \\"./http\\"
    export * from \\"./exit\\"
    "
    `)
    //     expect((await fetch(`${url}/json`)).headers).toMatchInlineSnapshot(`
    // Headers {
    //   Symbol(map): Object {
    //     "access-control-allow-origin": Array [
    //       "*",
    //     ],
    //     "connection": Array [
    //       "close",
    //     ],
    //     "content-length": Array [
    //       "21",
    //     ],
    //     "content-type": Array [
    //       "application/json; charset=utf-8",
    //     ],
    //     "date": Array [
    //       "Sun, 17 Oct 2021 16:03:17 GMT",
    //     ],
    //     "etag": Array [
    //       "W/\\"15-NPecLBGp9LrhKRjBkTXrX5trmSw\\"",
    //     ],
    //     "expect-ct": Array [
    //       "max-age=0",
    //     ],
    //     "referrer-policy": Array [
    //       "no-referrer",
    //     ],
    //     "strict-transport-security": Array [
    //       "max-age=15552000; includeSubDomains",
    //     ],
    //     "x-content-type-options": Array [
    //       "nosniff",
    //     ],
    //     "x-dns-prefetch-control": Array [
    //       "off",
    //     ],
    //     "x-download-options": Array [
    //       "noopen",
    //     ],
    //     "x-frame-options": Array [
    //       "SAMEORIGIN",
    //     ],
    //     "x-permitted-cross-domain-policies": Array [
    //       "none",
    //     ],
    //     "x-xss-protection": Array [
    //       "0",
    //     ],
    //   },
    // }
    // `)
  })
})
