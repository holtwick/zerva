import { parse } from "./auth"

describe("auth.spec", () => {
  it("should auth", async () => {
    expect(parse('Basic YTpi')).toMatchInlineSnapshot(`
      {
        "password": "b",
        "user": "a",
      }
    `)
  })
})