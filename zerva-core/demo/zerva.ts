import { onStart, onStop, serve } from "../src"
import { Logger, LoggerInterface, sleep } from "zeed"

const log: LoggerInterface = Logger("demo")

log('demo')

onStart(() => {
  log('start')
  setInterval(() => log('do ...'), 1000)
})

onStop(async () => {
  log('stop')
  await sleep(1000)
  log('stop done')
})

serve()