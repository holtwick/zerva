// Alternative implementation:
//
// Simple demo for node and CommonJS loading

import { Logger, setupEnv } from "zeed"
import z, { useHttp } from "@zerva/core"

const log = Logger("demo")

setupEnv()

function useCounter() {
  z.register("counter", ["http"])
  let counter = 1
  z.on("httpInit", ({ get }) => {
    get(
      "/",
      () =>
        `<div>Counter ${counter++}.<br><br>Reload page to increase counter. </div>`
    )
  })
  return {
    getCounter: () => counter,
  }
}

log("Setup zerva")
log.info("DEMO_SECRET =", process.env.DEMO_SECRET)

useHttp({
  port: 8080,
})

useCounter()

z.serve()
