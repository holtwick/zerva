import { serveStop } from "../serve"
import { Logger } from "zeed"

const log = Logger("zerva:exit")

/**
 * Handle exit signals gracefully and let modules perform `serveStop`
 */
export function useExit(config: any = {}) {
  log.info("exit")

  process.on("exit", async () => {
    log.info("exit received")
    // await serveStop()
  })

  process.on("SIGABRT", async () => {
    log.info("SIGABRT received")
    await serveStop()
  })

  process.on("SIGQUIT", async () => {
    log.info("SIGQUIT received")
    await serveStop()
  })

  process.on("SIGINT", async () => {
    log.info("SIGINT received")
    await serveStop()
  })

  process.on("SIGTERM", async () => {
    log.info("SIGTERM received")
    await serveStop()
  })
}
