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

    // expect(
    //   await fetchJson(`${url}/`, {
    //     method: "POST",
    //     headers: {
    //       "content-type": "application/json",
    //     },
    //     body: {
    //       hello: "world",
    //     },
    //   })
    // ).toMatchInlineSnapshot("undefined")

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
  })
})
