// Simple demo for node and CommonJS loading

import {
  Logger,
  LoggerNodeHandler,
  LoggerFileHandler,
  LogLevel,
  setupEnv,
} from "zeed"

Logger.setHandlers([
  LoggerFileHandler("zerva.log", {
    level: LogLevel.debug,
  }),
  LoggerNodeHandler({
    level: LogLevel.info,
    filter: "*",
    colors: true,
    padding: 16,
    nameBrackets: false,
    levelHelper: false,
  }),
])

import { serve, useHttp, register, on } from "zerva"

const log = Logger("demo")

setupEnv()

function useCounter() {
  register("counter", ["http"])
  let counter = 1
  on("httpInit", ({ get }) => {
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

serve()
