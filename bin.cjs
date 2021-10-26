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

const entryCandidates = [
  "zerva.ts",
  "zerva.js",
  "main.ts",
  "main.js",
  "zerva/main.ts",
  "zerva/main.js",
  "service/main.ts",
  "service/main.js",
  "src/zerva.ts",
  "src/zerva.js",
  "src/main.ts",
  "src/main.js",
]

if (entry) {
  entry = resolve(entry)
} else {
  for (const entryCandidate of entryCandidates) {
    if (existsSync(resolve(entryCandidate))) {
      entry = entryCandidate
      break
    }
  }
}

if (!existsSync(entry)) {
  console.error(`Cannot find entry file: ${entry}`)
  process.exit(1)
}

// Cleanup to args to not confuse estrella
process.argv.splice(2, process.argv.length - 2)

const { build } = require("esbuild")

// import pkg from "./package.json"
const notifier = require("node-notifier")
const { spawn } = require("child_process")

let p
let pWait

async function stopNode() {
  if (p) {
    console.log("Stopping app...\n")
    new Promise((resolve) => (pWait = resolve))
    p.kill("SIGTERM")
    // p.kill("SIGKILL")
    p = undefined
  }
}

async function startNode() {
  await stopNode()
  p = spawn(process.execPath, [outfile], {
    cwd: process.cwd(),
    stdio: "inherit",
  })
  console.info("Starting app")
  p.on("error", (err) => {
    console.error("Node process error:", err)
  })
  p.on("close", (code) => {
    // console.info("Node process close with code:", code)
    if (pWait) {
      pWait()
      pWait = undefined
    }
  })
  // p.on("exit", () => {
  //   console.info("Node process exit.")
  // })
}

// Started from command line
const result = build({
  // target: "es2017",
  bundle: true,
  entryPoints: [entry],
  outfile,
  platform: "node",
  sourcemap: "inline",
  loader: {
    ".json": "json",
  },
  minify: buildMode,
  // run: !buildMode,
  watch: buildMode
    ? false
    : {
        onRebuild(error, result) {
          if (error) {
            stopNode()
            // console.error(`Build failed with error:`, error)
            let icon = resolve(__dirname, "icon.png")
            // https://github.com/mikaelbr/node-notifier
            notifier.notify({
              title: "Zerva Build Error",
              message: String(error),
              icon,
              sound: true,
            })
          } else {
            console.info("Build succeeded.")
            startNode()
          }
        },
      },
  // tslint: !buildMode,
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
})

result
  .then((res) => {
    if (!buildMode) {
      startNode()
    } else {
      console.info(`Build to ${outfile}`)
    }
  })
  .catch((err) => {})
