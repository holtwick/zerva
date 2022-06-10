import { register, zerva } from "@zerva/core"
import { useHttp } from "@zerva/http"

// import { Logger } from "zeed"
// const log = Logger("sandbox")

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

useHttp({
  port: 8080,
})

useCounter()

// log.info('All set up!')