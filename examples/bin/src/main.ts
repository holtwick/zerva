// Simple demo for node and CommonJS loading

import { Logger, on, serve, valueToInteger } from "@zerva/core"
import { useHttp } from "@zerva/http"
import { useCounter } from "./module"

const log = Logger("app")

// console.log(process.env, ZERVA_VERSION)
// log.info(loggerStackTraceDebug)
log.info("Start...")

// useQrCode()

useHttp({
  port: valueToInteger(process.env.PORT, 8080),
})

on("counterIncrement", (counter) => {
  log.info("counter inc", counter)
})

useCounter()

on("httpInit", ({ addStatic }) => {
  addStatic("/public", "public")
})

serve()
