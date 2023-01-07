// (C)opyright 2021 Dirk Holtwick, holtwick.de. All rights reserved.

import { existsSync } from "fs"
import { resolve } from "path"
import { arrayRemoveElement, parseArgs } from "zeed"
import { entryCandidates } from "./static"

export interface ZervaConf {
  version: string
  build: boolean
  outfile: string
  metafile: boolean
  help: boolean
  esm: boolean
  sourcemap: boolean
  entry: string
  debug: boolean
  external: string[]
  define: Record<string, string>
  loader: Record<string, string>
  esbuild: Record<string, string>
  args: any
}

export function getConfig(): ZervaConf {
  let config: Partial<ZervaConf> = {
    build: false,
    help: false,
    esm: false,
    version: "",
    metafile: true,
    sourcemap: true,
    debug: false,
    external: [],
    define: {},
    loader: {},
    esbuild: {},
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
    args: process.argv.slice(2),
    alias: {
      build: ["b"],
      debug: ["d"],
      esm: ["e"],
      help: ["h", "?"],
    },
    booleanArgs: ["build", "noSourcemap", "debug", "help", "esm"],
    listArgs: ["external", "loader", "define", "esbuild"],
  })

  config.debug = !!args.debug
  config.args = args
  config.help = args.help
  config.sourcemap = !args.noSourcemap
  config.metafile = !args.metafile
  config.external = args.external ?? []
  config.build = args.build ?? args._.includes("build")
  config.esm = args.esm
  config.loader = Object.fromEntries(
    (args.loader ?? []).map((s: string) => s.split(":", 2))
  )
  config.define = Object.fromEntries(
    (args.define ?? []).map((s: string) => s.split(":", 2))
  )
  config.esbuild = Object.fromEntries(
    (args.esbuild ?? []).map((s: string) => s.split(":", 2))
  )

  if (config.debug) {
    console.log("argv =", process.argv)
  }

  args._ = arrayRemoveElement(args._, "build")

  const suffix = config.esm ? "mjs" : "cjs"

  if (config.build) {
    config.outfile = args.outfile ?? resolve(`dist/main.${suffix}`)
    config.build = true
  } else {
    config.outfile = args.outfile ?? resolve(`.out.${suffix}`)
    config.sourcemap = true
  }

  if (args._.length > 0) {
    config.entry = resolve(args._[0])
  } else {
    for (const entryCandidate of entryCandidates) {
      if (existsSync(resolve(entryCandidate))) {
        config.entry = entryCandidate
        break
      }
    }
  }

  if (config.debug) console.log("config =", config)
  return config as ZervaConf
}
