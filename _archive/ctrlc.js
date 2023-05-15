// NOTE: although it is tempting, the SIGKILL signal (9) cannot be intercepted and handled
const signals = {
  SIGHUP: 1,
  SIGINT: 2,
  SIGTERM: 15,
}

let isPerformingExit = false

// on('serveDispose', () => process.exit(0))

let c = 0
setInterval(() => console.log(c++), 1000)

Object.keys(signals).forEach((signal) => {
  process.on(signal, () => {
    if (!isPerformingExit) {
      isPerformingExit = true
      console.log(`Process received a ${signal} signal`)
      // serveStop().then(() => {
      //   // process.exit(128 + (+signals[signal] ?? 0))
      //   // log('Process EXIT')
      //   process.exit(0)
      // }).catch((err) => {
      //   log.error(`Error on srveStop: ${err}`)
      // })
    }
    else {
      console.log(`Ignoring: Process received a ${signal} signal`)
    }
  })
})
