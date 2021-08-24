// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { Logger, LoggerNodeHandler, LogLevel } from "zeed"
import { emit, serve, useHttp } from "../index.js"
import fetch from "node-fetch"
import { on } from "../context.js"

Logger.setHandlers([
  LoggerNodeHandler({
    level: LogLevel.info,
    filter: "*",
    colors: true,
    padding: 16,
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
    expect(
await (await fetch(`${url}/index.ts`)).text()).
toMatchInlineSnapshot(`
"// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

export * from \\"./http.js\\"
export * from \\"./exit.js\\"
"
`)
  })
})
