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

import { serve, http, register, on } from "zerva"

function counter() {
  register("counter", ["http"])
  let counter = 1
  on("httpInit", ({ get }) => {
    get(
      "/",
      () => `Counter ${counter++}.<br><br>Reload page to increase counter.`
    )
  })
  return {
    getCounter: () => counter,
  }
}

serve(() => {
  http({
    port: 8080,
  })
  counter()
})
