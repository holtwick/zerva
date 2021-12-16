import { emit, Logger, on, register } from "zerva"

const log = Logger("counter")

declare global {
  interface ZContextEvents {
    counterIncrement(counter: number): void
  }
}

export function useCounter() {
  log.info("use counter")
  register("counter", ["http"])
  let counter = 0
  on("httpInit", ({ get }) => {
    get("/", async () => {
      await emit("counterIncrement", ++counter)
      return `Counter ${counter}.<br><br>Reload page to increase counter.`
    })
  })
}
