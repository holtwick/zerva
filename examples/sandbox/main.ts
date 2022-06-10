// Alternative implementation:
//
// Simple demo for node and CommonJS loading

import { register, serve, zerva } from "@zerva/core"
import { useHttp } from "@zerva/http"
import { Logger, sleep } from "zeed"

const log = Logger("demo")

function useCounter() {
  register("counter", ["http"])
  let counter = 1

  zerva.on("httpInit", ({ get }) => {
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

async function main() {
  log("Setup zerva")

  sleep(1000)

  useHttp({
    port: 8080,
  })

  useCounter()

  log("Setup end")
}

main().then(() => log("done"))
