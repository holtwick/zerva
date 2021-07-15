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
} from "./context"

declare global {
  interface ZContextEvents {
    test(x: number): void
  }
}

describe("context", () => {
  it("should emit", (done) => {
    expect.assertions(1)
    setContext()
    on("test", (x) => {
      expect(x).toBe(123)
      done()
    })
    emit("test", 123)
  })

  it("should register", () => {
    setContext()
    register("a")
    register("b", "a")
    expect(hasModule("c")).toBe(false)
    expect(hasModule("a")).toBe(true)
    requireModules("a")
    // requireModules(["x"])
  })

  it("should allow sub-context", async () => {
    setContext()
    register("a")
    expect(hasModule("a")).toBe(true)
    createContext(() => {
      expect(hasModule("a")).toBe(false)
      register("b")
      expect(hasModule("b")).toBe(true)
    })
    expect(hasModule("a")).toBe(true)
    expect(hasModule("b")).toBe(false)
  })
})
