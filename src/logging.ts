import { Logger, LoggerFileHandler, LoggerNodeHandler, toPath } from "zeed"

let handlers = [
  LoggerNodeHandler({
    padding: 32,
    nameBrackets: false,
    levelHelper: false,
  }),
]

if (process.env.LOG) {
  handlers.unshift(LoggerFileHandler(toPath(process.env.LOG)))
}

Logger.setHandlers(handlers)
