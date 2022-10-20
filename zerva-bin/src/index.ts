#!/usr/bin/env node

// (C)opyright 2021 Dirk Holtwick, holtwick.de. All rights reserved.

import { existsSync } from "fs"
import { runMain } from "./main"
import { getConfig } from "./config"

function main() {
  let config = getConfig()

  if (config.help) {
    console.info(
      `usage: ${
        process.argv?.[1]?.trim()?.toLocaleLowerCase() || ""
      } [options] <entryFile>

If started without arguments, the entry file is searched in default locations and the
debug server will be started. The files will be watched for changes and the debug server
is restarted on every update.

--build, -b         Build, else run debug server
--outfile, -o       Target file
--esm, -e           Build ESM else CJS
--no-sourcemap      Do not emit source maps
--external=name     Exclude package from bundle (see esbuild)      
--loader=.suf:type  Loaders for file types (see esbuild)     
--define=key:value  Text replacement before compiling (see esbuild)
--esbuild=key:value Additional esbuild configs
`
    )
    return
  }

  if (!config.entry || !existsSync(config.entry)) {
    console.error(`Zerva: Cannot find entry file: ${config.entry}`)
    process.exit(1)
  }

  // Cleanup to args
  // process.argv.splice(2, process.argv.length - 2)

  runMain(config)
}

main()
