import { on, emit } from "./context"

declare global {
  interface ZContextEvents {
    test(x: number): void
  }
}

describe("context", () => {
  it("should emit", (done) => {
    expect.assertions(1)
    on("test", (x) => {
      expect(x).toBe(123)
      done()
    })
    emit("test", 123)
  })
})
