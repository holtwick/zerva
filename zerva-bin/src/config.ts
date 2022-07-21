// (C)opyright 2021 Dirk Holtwick, holtwick.de. All rights reserved.

import { existsSync } from "fs"
import { resolve } from "path"
import { arrayRemoveElement, parseArgs } from "zeed"

interface ZervaConf {
  version: string
  build: boolean
  outfile: string
  help: boolean
  sourcemap: boolean
  entry: string
  debug: boolean
  external: string[]
  args: any
}

export function getConfig(): ZervaConf {
  let config: Partial<ZervaConf> = {
    build: false,
    help: false,
    version: "",
    sourcemap: true,
    debug: false,
    external: [],
    args: {},
  }

  try {
    const pkg = require(resolve(process.cwd(), "package.json"))
    config.version = pkg.version
  } catch (err) {}

  try {
    const configFromFile = require(resolve(process.cwd(), "zerva.conf.js"))
    if (configFromFile) Object.assign(config, configFromFile)
  } catch (err) {}

  const args = parseArgs({
    alias: {
      build: ["b"],
      debug: ["d"],
    },
    booleanArgs: ["build", "noSourcemap", "debug"],
    listArgs: ["external"],
  })

  config.debug = !!args.debug
  config.args = args
  config.help = args.help
  config.sourcemap = !args.noSourcemap
  config.external = args.external ?? []
  config.build = args.build ?? args._.includes("build")

  args._ = arrayRemoveElement(args._, "build")

  if (config.build) {
    config.outfile = args.outfile ?? resolve("dist/main.cjs")
    config.build = true
  } else {
    config.outfile = args.outfile ?? resolve(".out.cjs")

    // Provide meaningful error messages using sourcemaps
    process.env.NODE_OPTIONS = "--enable-source-maps"
  }

  if (config.entry) {
    config.entry = resolve(config.entry)
  } else {
    for (const entryCandidate of entryCandidates) {
      if (existsSync(resolve(entryCandidate))) {
        config.entry = entryCandidate
        break
      }
    }
  }

  // Cleanup to args
  process.argv.splice(2, process.argv.length - 2)

  if (config.debug) console.log("config =", config)
  return config as ZervaConf
}

const entryCandidates = [
  "zerva.ts",
  "zerva.js",
  "service.ts",
  "service.js",
  "main.ts",
  "main.js",
  "zerva/main.ts",
  "zerva/main.js",
  "service/main.ts",
  "service/main.js",
  "src/zerva.ts",
  "src/zerva.js",
  "src/service.ts",
  "src/service.js",
  "src/main.ts",
  "src/main.js",
  "index.ts",
  "index.js",
  "zerva/index.ts",
  "zerva/index.js",
  "service/index.ts",
  "service/index.js",
  "src/index.ts",
  "src/index.js",
]
