// Inspired by https://medium.com/@becintec/building-graceful-node-applications-in-docker-4d2cd4d5d392

import { serveStop } from "@zerva/core"
import type { LoggerInterface } from 'zeed'
import { Logger } from 'zeed'

const log: LoggerInterface = Logger('zerva:exit')

/** @deprecated */
export function useExit(config: any = {}) {
  // NOTE: although it is tempting, the SIGKILL signal (9) cannot be intercepted and handled
  const signals:any = {
    SIGHUP: 1,
    SIGINT: 2,
    SIGTERM: 15,
  }

  Object.keys(signals).forEach((signal) => {
    process.on(signal, async () => {
      log.info(`process received a ${signal} signal`)
      await serveStop()
      process.exit(128 + (signals[signal] ?? 0))
    })
  })
}
