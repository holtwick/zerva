// Simple demo for node and CommonJS loading

import { Logger, LoggerNodeHandler, LoggerFileHandler, LogLevel } from "zeed"

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

const log = Logger("app")

import { serve, useHttp, register, on } from "zerva"

function useCounter() {
  log.info("use counter")
  register("counter", ["http"])
  let counter = 1
  on("httpInit", ({ get }) => {
    get(
      "/",
      () => `Counter ${counter++}.<br><br>Reload page to increase counter.`
    )
  })
}

useHttp({
  port: 8080,
})
useCounter()

serve()
