#!/usr/bin/env node

// (C)opyright 2021 Dirk Holtwick, holtwick.de. All rights reserved.

// if (process.argv.length < 3) {
//   console.info(`Usage: zerva <your-zerva.ts>`)
//   process.exit(-1)
// }

const { resolve } = require("path")
const { existsSync } = require("fs")
const { build } = require("esbuild")
const { spawn } = require("child_process")

let version = "?"

try {
  const pkg = require(resolve(process.cwd(), "package.json"))
  version = pkg.version
} catch (err) {}

let entry
let outfile = resolve(".out.cjs")
let buildMode = false

const cmd = process.argv?.[2]?.trim()?.toLocaleLowerCase() || ""
let minimal = false

if (cmd === "build" || cmd === "minimal") {
  entry = process.argv[3]
  outfile = resolve("dist/main.cjs")
  buildMode = true
  minimal = cmd === "minimal"
} else {
  // Provide meaningful error messages using sourcemaps
  process.env.NODE_OPTIONS = "--enable-source-maps"
  entry = process.argv[2]
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

let zervaNodeProcess
let zervaNodeProcessDidEndPromise

async function stopNode() {
  if (zervaNodeProcess) {
    console.log("Stopping app...\n")
    new Promise((resolve) => (zervaNodeProcessDidEndPromise = resolve))
    zervaNodeProcess.kill("SIGTERM")
    // p.kill("SIGKILL")
    zervaNodeProcess = undefined
  }
}

async function startNode() {
  await stopNode()
  zervaNodeProcess = spawn(process.execPath, [outfile], {
    cwd: process.cwd(),
    stdio: "inherit",
    env: {
      ...process.env,
      ZERVA_MODE: "development",
      ZERVA_VERSION: version,
    },
  })
  console.info("Starting app")
  zervaNodeProcess.on("error", (err) => {
    console.error("Node process error:", err)
  })
  zervaNodeProcess.on("close", (code) => {
    // console.info("Node process close with code:", code)
    if (zervaNodeProcessDidEndPromise) {
      zervaNodeProcessDidEndPromise()
      zervaNodeProcessDidEndPromise = undefined
    }
  })
  // p.on("exit", () => {
  //   console.info("Node process exit.")
  // })
}

function notifyError(error) {
  if (!buildMode) {
    // https://github.com/mikaelbr/node-notifier
    const notifier = require("node-notifier")
    if (notifier)
      notifier.notify({
        title: "Zerva Build Error",
        message: String(error),
        icon: resolve(__dirname, "icon.png"),
        sound: true,
      })
  }
}

console.info(`Building from entry file ${entry}`)

// Started from command line
const result = build({
  target: "es2020",
  bundle: true,
  entryPoints: [entry],
  outfile,
  platform: "node",
  sourcemap: minimal ? undefined : true, //"inline",
  loader: {
    ".json": "json",
  },
  define: {
    // ZERVA_MODE: buildMode ? "production" : "development",
    ZERVA_DEVELOPMENT: !buildMode,
    ZERVA_PRODUCTION: buildMode,
    ZERVA_VERSION: `"${version}"`,
    "process.env.ZERVA_DEVELOPMENT": !buildMode,
    "process.env.ZERVA_PRODUCTION": buildMode,
    "process.env.ZERVA_VERSION": `"${version}"`,
  },
  minify: buildMode,
  watch: buildMode
    ? false
    : {
        onRebuild(error, result) {
          if (error) {
            stopNode()
            notifyError(error)
          } else {
            console.info("Rebuild succeeded.")
            startNode()
          }
        },
      },
  // tslint: !buildMode,
  external: [
    "notifier",
    "esbuild",
    "vite",
    // "express",
    // ...Object.keys(pkg.dependencies),
    // ...Object.keys(pkg.devDependencies ?? {}),
    // ...Object.keys(pkg.peerDependencies ?? {}),
  ],
})

result
  .then((res) => {
    if (!buildMode) {
      startNode()
    } else {
      console.info(`Build to ${outfile} succeeded.`)
    }
  })
  .catch((error) => {
    notifyError(error)
  })
