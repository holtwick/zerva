#!/usr/bin/env node

// (C)opyright 2021 Dirk Holtwick, holtwick.de. All rights reserved.

// if (process.argv.length < 3) {
//   console.info(`Zerva: Usage: zerva <your-zerva.ts>`)
//   process.exit(-1)
// }

import { resolve, normalize } from "path"
import { existsSync, chmodSync } from "fs"
import { build, BuildFailure } from "esbuild"
import { ChildProcess, spawn } from "child_process"

function main() {
  let version = "?"

  let config = {
    root: ".",
    buildMode: false,
    outfile: "",
  }

  try {
    const pkg = require(resolve(process.cwd(), "package.json"))
    version = pkg.version
  } catch (err) {}

  try {
    const configFromFile = require(resolve(process.cwd(), "zerva.conf.js"))
    if (configFromFile) Object.assign(config, configFromFile)
  } catch (err) {}

  let entry
  let outfile = resolve(".out.cjs")
  let buildMode = false

  function parseArgs(): any {
    const args = process.argv.slice(2)
    const alias = {
      help: ["h", "?"],
    }
    const normalize = (s: string) => s

    let nameToAlias = Object.entries(alias).reduce((map, curr) => {
      let [name, values] = curr
      if (typeof values === "string") values = [values]
      for (let value of values) {
        map[normalize(value)] = normalize(name)
      }
      return map
    }, {})

    let opts = {}
    let curSwitch

    for (let arg of args) {
      let value = arg

      if (/^--?/.test(arg) || curSwitch == null) {
        curSwitch = arg.replace(/^--?/, "")

        if (arg.includes("=")) {
          let [name, valuePart] = curSwitch.split("=", 2)
          curSwitch = name.trim()
          value = valuePart.trim()
        } else {
          value = true
        }

        curSwitch = normalize(curSwitch)
        curSwitch = nameToAlias[curSwitch] ?? curSwitch
      }

      if (curSwitch != null) {
        if (arg === "false") {
          value = false
        } else if (arg === "true") {
          value = true
        }

        if (opts[curSwitch] == null) {
          opts[curSwitch] = value
        } else if (typeof opts[curSwitch] === "boolean") {
          opts[curSwitch] = value
        } else if (Array.isArray(opts[curSwitch])) {
          opts[curSwitch].push(value)
        } else {
          opts[curSwitch] = [opts[curSwitch], value]
        }
      }
    }

    return opts
  }

  // const cmd = process.argv?.[2]?.trim()?.toLocaleLowerCase() || ""
  const cmd = process.argv?.[1]?.trim()?.toLocaleLowerCase() || ""
  const args = parseArgs()

  console.log(cmd, "args", args)

  if (args.help) {
    console.info(`usage: ${cmd} [options]`)
    return
  }

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
    console.error(`Zerva: Cannot find entry file: ${entry}`)
    process.exit(1)
  }

  // Cleanup to args to not confuse estrella
  process.argv.splice(2, process.argv.length - 2)

  let zervaNodeProcess: ChildProcess | undefined
  let zervaNodeProcessDidEndPromise: ((value?: unknown) => void) | undefined

  async function stopNode() {
    if (zervaNodeProcess) {
      console.log("Zerva: Stopping app\n")
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
    console.info("Zerva: Starting app")
    zervaNodeProcess.on("error", (err) => {
      console.error("Node process error:", err)
    })
    zervaNodeProcess.on("close", (code) => {
      // console.info("Zerva: Node process close with code:", code)
      if (zervaNodeProcessDidEndPromise) {
        zervaNodeProcessDidEndPromise()
        zervaNodeProcessDidEndPromise = undefined
      }
    })
    // zervaNodeProcess.on("exit", () => {
    //   console.info("Zerva: Node process exit.")
    // })
  }

  function notifyError(error: BuildFailure) {
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

  function toHumanReadableFilePath(path: string) {
    const p = normalize(path)
    const h = process.env.HOME
    if (h && p.startsWith(h)) {
      return "~" + p.slice(h.length)
    }
    return p
  }

  console.info(`Zerva: Building from "${toHumanReadableFilePath(entry)}"`)

  // Started from command line
  const result = build({
    target: "es2020",
    bundle: true,
    entryPoints: [entry],
    banner: {
      js: buildMode
        ? "#!/usr/bin/env node\n\n// Generated by Zerva <https://holtwick.de/zerva>\n"
        : "// Temporary Build. Generated by Zerva <https://holtwick.de/zerva>\n",
    },
    footer: {
      // js: "console.log('TEST')",
    },
    legalComments: "none",
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
    } as any,
    minify: buildMode,
    watch: buildMode
      ? false
      : {
          onRebuild(error, result) {
            stopNode()
            if (error) {
              notifyError(error)
            } else {
              console.info("Zerva: Rebuild succeeded.")
              startNode()
            }
          },
        },
    // tslint: !buildMode,
    external: [
      "notifier",
      "node-notifier",
      "esbuild",
      "vite", // ?
      // "express",
      // ...Object.keys(pkg.dependencies),
      // ...Object.keys(pkg.devDependencies ?? {}),
      // ...Object.keys(pkg.peerDependencies ?? {}),
    ],
  })

  result
    .then((res) => {
      try {
        chmodSync(outfile, 0o755)
      } catch (err) {}

      if (!buildMode) {
        startNode()
      } else {
        console.info(
          `Zerva: Building to "${toHumanReadableFilePath(outfile)}" succeeded.`
        )
      }
    })
    .catch((error) => {
      notifyError(error)
    })
}

main()
