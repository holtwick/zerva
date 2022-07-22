import readme from "README.md"

console.log("test via console", readme.length)

import { Logger } from "zeed"
const log = Logger("test")
log.info("test via zeed")

function catchSome() {
  throw new Error("fake")
}

// test
// catchSome()
