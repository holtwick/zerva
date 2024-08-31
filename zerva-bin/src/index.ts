#!/usr/bin/env node
/* eslint-disable no-console */

import { existsSync } from 'node:fs'
import process from 'node:process'
import { runMain } from './main'
import { getConfig } from './config'

async function main() {
  const config = getConfig()

  if (config.help) {
    console.info(
      `usage: ${process.argv?.[1]?.trim()?.toLocaleLowerCase() || ''
      } [options] <entryFile>

Node:    ${process.argv?.[0] ?? '-'}
Version: ${config.version}

If started without arguments, the entry file is searched in default locations and the
debug server will be started. The files will be watched for changes and the debug server
is restarted on every update.

--build, -b         Build, else run debug server
--outfile, -o       Target file
--cjs               Build CJS, default is ESM
--open, -s          Open browser
--no-sourcemap      Do not emit source maps
--external=name     Exclude package from bundle (see esbuild)      
--loader=.suf:type  Loaders for file types (see esbuild)     
--define=key:value  Text replacement before compiling (see esbuild)
--esbuild=key:value Additional esbuild configs
--node=arg          Command line argument to be added to node execution
--mode=mode         Is passed to process.env.ZERVA_MODE and is used in @zerva/vite
--bun               Execute with bun.sh
--deno              Execute with deno.com
`,
    )
    return
  }

  if (!config.entry || !existsSync(config.entry)) {
    console.error(`Zerva: Cannot find entry file: ${config.entry}`)
    process.exit(1)
  }

  // Cleanup to args
  // process.argv.splice(2, process.argv.length - 2)

  await runMain(config)
}

void main()
