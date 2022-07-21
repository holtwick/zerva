#!/usr/bin/env node

// (C)opyright 2021 Dirk Holtwick, holtwick.de. All rights reserved.

import { resolve, normalize } from "path"
import { existsSync, chmodSync } from "fs"
import { build, BuildFailure } from "esbuild"
import { ChildProcess, spawn } from "child_process"
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
--no-sourcemap      Do not emit source maps
--external=name     Exclude package from bundle (see esbuild)           
`
    )
    return
  }

  if (!config.entry || !existsSync(config.entry)) {
    console.error(`Zerva: Cannot find entry file: ${config.entry}`)
    process.exit(1)
  }

  // Cleanup to args
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
    zervaNodeProcess = spawn(process.execPath, [config.outfile], {
      cwd: process.cwd(),
      stdio: "inherit",
      env: {
        ...process.env,
        ZERVA_MODE: "development",
        ZERVA_VERSION: config.version,
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
    if (!config.build) {
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

  console.info(
    `Zerva: Building from "${toHumanReadableFilePath(config.entry)}"`
  )

  // Started from command line
  const result = build({
    target: "es2020",
    bundle: true,
    entryPoints: [config.entry],
    banner: {
      js: config.build
        ? "#!/usr/bin/env node\n\n// Generated by Zerva <https://holtwick.de/zerva>\n"
        : "// Temporary Build. Generated by Zerva <https://holtwick.de/zerva>\n",
    },
    footer: {
      // js: "console.log('TEST')",
    },
    legalComments: "none",
    outfile: config.outfile,
    platform: "node",
    sourcemap: config.sourcemap,
    loader: {
      ".json": "json",
    },
    define: {
      // ZERVA_MODE: buildMode ? "production" : "development",
      ZERVA_DEVELOPMENT: !config.build,
      ZERVA_PRODUCTION: config.build,
      ZERVA_VERSION: `"${config.version}"`,
      "process.env.ZERVA_DEVELOPMENT": !config.build,
      "process.env.ZERVA_PRODUCTION": config.build,
      "process.env.ZERVA_VERSION": `"${config.version}"`,
    } as any,
    minify: config.build,
    watch: config.build
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
      //
      "notifier",
      "node-notifier",
      "esbuild",
      "vite",
    ],
  })

  result
    .then((res) => {
      try {
        chmodSync(config.outfile, 0o755)
      } catch (err) {}

      if (!config.build) {
        startNode()
      } else {
        console.info(
          `Zerva: Building to "${toHumanReadableFilePath(
            config.outfile
          )}" succeeded.`
        )
      }
    })
    .catch((error) => {
      notifyError(error)
    })
}

main()
