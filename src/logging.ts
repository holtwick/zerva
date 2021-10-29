import {
  Logger,
  LoggerFileHandler,
  LoggerNodeHandler,
  LogLevel,
  toPath,
} from "zeed"

let handlers = [
  LoggerNodeHandler({
    padding: 32,
    nameBrackets: false,
    levelHelper: false,
  }),
]

if (process.env.LOG) {
  handlers.unshift(
    LoggerFileHandler(toPath(process.env.LOG), {
      level: LogLevel.all,
    })
  )
}

Logger.setHandlers(handlers)
