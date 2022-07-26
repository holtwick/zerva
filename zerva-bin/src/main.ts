import { ChildProcess, spawn } from "child_process"
import { build, BuildFailure, BuildOptions } from "esbuild"
import { chmod } from "fs/promises"
import { normalize, resolve } from "path"
import { ZervaConf } from "./config"

export function runMain(config: ZervaConf) {
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
    zervaNodeProcess = spawn(
      process.execPath,
      [
        //
        "--enable-source-maps",
        config.outfile,
      ],
      {
        cwd: process.cwd(),
        stdio: "inherit",
        env: {
          ...process.env,
          ZERVA_MODE: "development",
          ZERVA_VERSION: config.version,
        },
      }
    )
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
  const buildConfig: BuildOptions = {
    bundle: true,
    platform: "node",
    target: "node16",
    entryPoints: [config.entry],
    legalComments: "none",
    outfile: config.outfile,
    sourcemap: !config.build || config.sourcemap,
    loader: {
      ".json": "json",
      ...config.loader,
    },
    banner: {
      js: "/*\n\n    Generated by Zerva <https://github.com/holtwick/zerva>\n\n*/",
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
    external: config.build
      ? [
          //
          "esbuild",
          "fs",
          "fsevents",
          "notifier",
          "node-notifier",
          ...config.external,
        ]
      : [
          //
          "esbuild",
          "fs",
          "fsevents",
          "notifier",
          "node-notifier",
          "vite",
          ...config.external,
        ],
  }

  if (config.debug) console.log("build =", buildConfig)
  const result = build(buildConfig)

  result
    .then(async (res) => {
      try {
        await chmod(config.outfile, 0o755)
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
