/* eslint-disable ts/no-require-imports */
/* eslint-disable no-console */

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { arrayRemoveElement, parseArgs, setupEnv } from 'zeed'
import { entryCandidates } from './static'

export interface ZervaConf {
  args: any
  build: boolean
  bun: boolean
  cjs: boolean
  debug: boolean
  define: Record<string, string>
  deno: boolean
  entry: string
  esbuild: Record<string, string>
  esm: boolean
  external: string[]
  help: boolean
  loader: Record<string, string>
  metafile: boolean
  mode: string
  node: []
  open: boolean
  outfile: string
  sourcemap: boolean
  version: string
}

export function getConfig(): ZervaConf {
  const config: Partial<ZervaConf> = {
    args: {},
    build: false,
    bun: false,
    cjs: false,
    debug: false,
    define: {},
    deno: false,
    esbuild: {},
    esm: true,
    external: [],
    help: false,
    loader: {},
    metafile: true,
    mode: 'development',
    node: [],
    open: false,
    sourcemap: true,
    version: '',
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
  config.mode = args.mode ?? (config.build ? 'production' : 'development')
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

  // .env. and .env.local
  // .env.MODE and .env.MODE.local
  setupEnv({ mode: config.mode })
  if (config.debug)
    console.log('env =', process.env)

  return config as ZervaConf
}
