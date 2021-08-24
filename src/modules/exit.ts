import { serveStop } from "src/serve"
import { Logger } from "zeed"

const log = Logger("zerva:exit")

/**
 * Handle exit signals gracefully and let modules perform `serveStop`
 */
export function useExit(config: any = {}) {
  log("exit")

  process.on("exit", () => {
    serveStop()
  })

  process.on("SIGABRT", () => {
    serveStop()
  })

  process.on("SIGINT", function () {
    serveStop()
  })

  process.on("SIGTERM", function () {
    serveStop()
  })
}
