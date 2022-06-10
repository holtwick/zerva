import { on, register, serve, zerva } from "@zerva/core"
import { useHttp } from "@zerva/http"

import { Logger } from "zeed"
const log = Logger("sandbox")

declare global {
  interface ZContextEvents {
    counterInc(up: number): number
  }
}

function useCounter() {
  register("counter", ["http"])
  let counter = 1

  on({
    counterInc(up) {
      log("counterInc", up)
      return (counter += up)
    },
    httpInit({ get }) {
      get("/", ({ req }) => {
        log("get", req.path)
        return `<div>Counter ${counter++}.<br><br>Reload page to increase counter. </div>`
      })
    },
  })

  return {
    getCounter: () => counter,
  }
}

useHttp({
  port: 8080,
})

useCounter()

setTimeout(() => {
  zerva.call.counterInc(100)
}, 5e3)

// We start the server manually, it would only start automatically
// after all timeouts have finished and that would not be great

serve()