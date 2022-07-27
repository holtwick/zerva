// @ts-ignore
import readme from "../README.md"

// @ts-ignore
import data from "./data.yml"

console.log("test via console", readme.length, data)

import { Logger } from "zeed"
const log = Logger("test")
log.info("test via zeed")

function catchSome() {
  throw new Error("fake")
}

// test
// catchSome()
