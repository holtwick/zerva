#!/usr/bin/env node

// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

if (process.argv.length < 3) {
  console.info(`Usage: zerva <your-zerva.ts>`)
  process.exit(-1)
}

const { resolve } = require("path")
const entry = resolve(process.argv[2])
process.argv.splice(2, process.argv.length - 2)

const { build } = require("estrella")

// import pkg from "./package.json"
const notifier = require("node-notifier")

// Started from command line
build({
  // target: "es2015",
  bundle: true,
  entry,
  outfile: resolve(".out.cjs"), // entry + "-bin.js",
  outfileMode: "+x",
  platform: "node",
  sourcemap: true,
  loader: {
    ".json": "json",
  },
  run: true,
  watch: true,
  // external: [
  //   "notifier",
  //   "mediasoup",
  //   "express",
  //   "ws",
  //   "engine.io",
  //   "chokidar",
  //   // ...Object.keys(pkg.dependencies),
  //   // ...Object.keys(pkg.devDependencies ?? {}),
  //   // ...Object.keys(pkg.peerDependencies ?? {}),
  // ],
  onEnd(config, result) {
    if (config.watch) {
      if (result.errors.length > 0) {
        console.error(`Build failed with ${result.errors.length} errors`)
        let icon = resolve(__dirname, "icon.png")
        //
        // https://github.com/mikaelbr/node-notifier
        notifier.notify({
          title: "Build Error",
          message: `Build failed with ${result.errors.length} errors`,
          icon,
          sound: true,
        })
      }
    }
  },
})
