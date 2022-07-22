console.log("test via console")

import { Logger } from "zeed"
const log = Logger("test")
log.info("test via zeed")

function catchSome() {
  throw new Error("fake")
}

// test
// catchSome()
