// Simple demo for node and CommonJS loading

import {
  Logger,
  LoggerFileHandler,
  LoggerNodeHandler,
  LogLevel,
  setupEnv,
  valueToInteger,
  valueToString,
} from "zeed"
import { emit, on, serve, useHttp } from "zerva"
import { useEmail } from "zerva-email"
import { useCounter } from "./module"

Logger.setHandlers([
  // LoggerFileHandler("/data/zerva.log", {
  //   level: LogLevel.debug,
  // }),
  LoggerNodeHandler({
    level: LogLevel.info,
    filter: "*",
    colors: true,
    padding: 16,
    nameBrackets: false,
    levelHelper: false,
  }),
])

setupEnv()

const log = Logger("app")

useHttp({
  port: 8080,
})

on("counterIncrement", (counter) => {
  log.info("counter inc", counter)
})

useCounter()

const transport = {
  host: valueToString(process.env.EMAIL_HOST),
  port: valueToInteger(process.env.EMAIL_PORT),
  secure: true,
  auth: {
    user: valueToString(process.env.EMAIL_USER),
    pass: valueToString(process.env.EMAIL_PASS),
  },
}

log.info("email transport", JSON.stringify(transport, null, 2))

useEmail({ transport })

on("httpInit", ({ get }) => {
  get("email", async () => {
    emit("emailSend", {
      to: "dirk.holtwick@gmail.com",
      // subject: "Test mail from docker",
    })
    return "did send email"
  })
})

serve()
