import { on, emit } from "./context"

declare module "./context" {
  interface ZContextEvents {
    test(): void
  }
}

describe("context", () => {
  it("should emit", (done) => {
    expect.assertions(1)
    on("test", () => done)
    emit("test")
  })
})
