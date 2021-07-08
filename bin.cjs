#!/usr/bin/env node

const { resolve } = require("path")
const entry = resolve(process.argv[2])
process.argv.splice(2, process.argv.length - 2)

const { build } = require("estrella")

// import pkg from "./package.json"
// const notifier = require("node-notifier")

// Started from command line
build({
  // bundle: true,
  // target: "es2015",

  entry,
  outfile: entry + "-bin.js",
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
  // onEnd(config, result) {
  //   if (config.watch) {
  //     if (result.errors.length > 0) {
  //       console.error(`Build failed with ${result.errors.length} errors`)
  //       let icon = resolve(__dirname, "icon.png")
  //       //
  //       // https://github.com/mikaelbr/node-notifier
  //       notifier.notify({
  //         title: "Build Error",
  //         message: `Build failed with ${result.errors.length} errors`,
  //         icon,
  //         sound: true,
  //       })
  //     }
  //   }
  // },
})
