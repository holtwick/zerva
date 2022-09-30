// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import {
  emit,
  fetchJson,
  fetchOptionsFormURLEncoded,
  fetchOptionsJson,
  on,
  serve,
} from "@zerva/core"
import "cross-fetch/polyfill"
import { useHttp } from "."

import { Logger } from "zeed"
const log = Logger("test-http")

const port = 8888
const url = `http://localhost:${port}`

describe("http", () => {
  beforeAll(async () => {
    useHttp({ port })

    on("httpInit", ({ get, post, addStatic }) => {
      // get("/test", ({ req }) => {
      //   req.protocol
      // })
      get("/hello", "Hello World")
      get("/json", { itIs: "json", v: 1 })
      get("/test2", ({ req }) => {
        req.protocol = "xxx"
      })

      post("/data", ({ req }) => {
        log("headers", req.headers)
        log("req", req.body)
        return req.body
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

    expect(
      (await (await fetch(`${url}/index.ts`)).text()).split("\n")[0]
    ).toEqual(
      "// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved."
    )

    // Json
    expect(
      await fetchJson(
        `${url}/data`,
        fetchOptionsJson({ hello: "world" }, "POST")
      )
    ).toMatchInlineSnapshot(`
      {
        "hello": "world",
      }
    `)

    // Classic form
    expect(
      await fetchJson(
        `${url}/data`,
        fetchOptionsFormURLEncoded({ hello: "world" }, "POST")
      )
    ).toMatchInlineSnapshot(`
      {
        "hello": "world",
      }
    `)

    // Binary
    let bin = new Uint8Array([1, 2, 3])
    let result = await fetch(`${url}/data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: bin,
    })

    let buffer = await result.arrayBuffer()
    let data = new Uint8Array(buffer)
    expect(data).toMatchInlineSnapshot(`
      Uint8Array [
        1,
        2,
        3,
      ]
    `)
  })
})
