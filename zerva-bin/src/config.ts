/* eslint-disable ts/no-var-requires */
/* eslint-disable ts/no-require-imports */
/* eslint-disable no-console */

// (C)opyright 2021 Dirk Holtwick, holtwick.de. All rights reserved.

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { arrayRemoveElement, parseArgs } from 'zeed'
import { entryCandidates } from './static'

export interface ZervaConf {
  version: string
  build: boolean
  bun: boolean
  deno: boolean
  outfile: string
  metafile: boolean
  help: boolean
  esm: boolean
  cjs: boolean
  sourcemap: boolean
  entry: string
  debug: boolean
  open: boolean
  external: string[]
  node: []
  define: Record<string, string>
  loader: Record<string, string>
  esbuild: Record<string, string>
  args: any
}

export function getConfig(): ZervaConf {
  const config: Partial<ZervaConf> = {
    build: false,
    bun: false,
    deno: false,
    help: false,
    esm: true,
    cjs: false,
    version: '',
    metafile: true,
    sourcemap: true,
    debug: false,
    open: false,
    external: [],
    define: {},
    loader: {},
    esbuild: {},
    node: [],
    args: {},
  }

  try {
    const pkg = require(resolve(process.cwd(), 'package.json'))
    config.version = pkg.version
  }
  catch (err) { }

  try {
    const configFromFile = require(resolve(process.cwd(), 'zerva.conf.js'))
    if (configFromFile)
      Object.assign(config, configFromFile)
  }
  catch (err) { }

  const args = parseArgs({
    args: process.argv.slice(2),
    alias: {
      build: ['b'],
      debug: ['d'],
      esm: ['e'],
      help: ['h', '?'],
    },
    booleanArgs: ['build', 'noSourcemap', 'debug', 'help', 'esm', 'cjs', 'bun', 'deno'],
    listArgs: ['external', 'loader', 'define', 'esbuild', 'node', 'lightningcss'],
  })

  config.debug = !!args.debug
  config.args = args
  config.help = args.help
  config.sourcemap = !args.noSourcemap
  config.metafile = !args.metafile
  config.external = args.external ?? []
  config.node = args.node ?? []
  config.build = args.build ?? args._.includes('build')
  config.esm = args.cjs !== true // default
  config.bun = args.bun
  config.deno = args.deno
  config.loader = Object.fromEntries(
    (args.loader ?? []).map((s: string) => s.split(':', 2)),
  )
  config.define = Object.fromEntries(
    (args.define ?? []).map((s: string) => s.split(':', 2)),
  )
  config.esbuild = Object.fromEntries(
    (args.esbuild ?? []).map((s: string) => s.split(':', 2)),
  )
  if (config.debug)
    console.log('argv =', process.argv)

  args._ = arrayRemoveElement(args._, 'build')

  const suffix = config.esm ? 'mjs' : 'cjs'

  if (config.build) {
    config.outfile = args.outfile ?? resolve(`dist/main.${suffix}`)
    config.build = true
  }
  else {
    config.outfile = args.outfile ?? resolve(`.out.${suffix}`)
    config.sourcemap = true
  }

  if (args._.length > 0) {
    config.entry = resolve(args._[0])
  }
  else {
    for (const entryCandidate of entryCandidates) {
      if (existsSync(resolve(entryCandidate))) {
        config.entry = entryCandidate
        break
      }
    }
  }

  if (config.debug)
    console.log('config =', config)
  return config as ZervaConf
}
