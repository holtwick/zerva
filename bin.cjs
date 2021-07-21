#!/usr/bin/env node

// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

// if (process.argv.length < 3) {
//   console.info(`Usage: zerva <your-zerva.ts>`)
//   process.exit(-1)
// }

const { resolve } = require("path")
const { existsSync } = require("fs")

let entry
let outfile = resolve(".out.cjs")
let buildMode = false

const cmd = process.argv?.[2]?.trim()?.toLocaleLowerCase() || ""

if (cmd === "build") {
  entry = process.argv[3]
  outfile = resolve("dist/main.cjs")
  buildMode = true
} else {
  // Provide meaningful error messages using sourcemaps
  process.env.NODE_OPTIONS = "--enable-source-maps"

  entry = process.argv[2]
}

if (entry) {
  entry = resolve(entry)
} else {
  entry = resolve("src/main.ts")
  if (!existsSync(entry)) {
    entry = resolve("src/main.js")
  }
}

if (!existsSync(entry)) {
  console.error(`Cannot find entry file: ${entry}`)
  process.exit(1)
}

// Cleanup to args to not confuse estrella
process.argv.splice(2, process.argv.length - 2)

const { build } = require("estrella")

// import pkg from "./package.json"
const notifier = require("node-notifier")

// Started from command line
build({
  target: "es2015",
  bundle: true,
  entry,
  outfile, // entry + "-bin.js",
  outfileMode: "+x",
  platform: "node",
  sourcemap: "inline",
  loader: {
    ".json": "json",
  },
  run: !buildMode,
  watch: !buildMode,
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
        console.error(`Build failed with ${result.errors.length} errors\n`)
        result.errors.forEach((err, i) =>
          console.info(`Error #${i + 1}:`, err.text)
        )
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
