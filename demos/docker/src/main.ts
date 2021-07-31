// Simple demo for node and CommonJS loading

import { Logger, LoggerNodeHandler, LoggerFileHandler, LogLevel } from "zeed"

import { on, serve, useHttp } from "zerva"
import { useCounter } from "./module"

Logger.setHandlers([
  LoggerFileHandler("/data/zerva.log", {
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

useHttp({
  host: '0.0.0.0',
  port: 8080,
})

on("counterIncrement", (counter) => {
  log.info("counter inc", counter)
})

useCounter()

serve()
