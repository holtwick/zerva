/* eslint-disable no-console */
import type { BuildOptions, Plugin } from 'esbuild'
import type { ChildProcess } from 'node:child_process'
import type { ZervaConf } from './config'
import { spawn } from 'node:child_process'
import { chmodSync } from 'node:fs'
import { chmod } from 'node:fs/promises'
import { normalize } from 'node:path'
import process from 'node:process'
import displayNotification from 'display-notification'
import { context } from 'esbuild'
import { yamlPlugin } from 'esbuild-plugin-yaml'
import { valueToBoolean } from 'zeed'

const DEFAULT_EXCLUDE = [
  'fs', // todo required?
  'fsevents',
  'notifier',
  'node-notifier',
  'esbuild', // via vite
  'lightningcss', // via vite
]

export async function runMain(config: ZervaConf) {
  const plugins: Plugin[] = [
    yamlPlugin({}) as any,
  ]

  let openBrowser = config.open

  if (!config.build) {
    //
    // Forced exit like CTRL-c
    //
    const keepAlive = setInterval(() => {
      // console.log('Zerva: Keep alive')
    }, 1000)

    let zervaNodeProcess: ChildProcess | undefined
    let zervaNodeProcessDidEndPromise: Promise<number> | undefined
    let zervaNodeProcessDidEndResolve: (value: number) => void | undefined

    // NOTE: although it is tempting, the SIGKILL signal (9) cannot be intercepted and handled
    const signals: any = {
      SIGHUP: 1,
      SIGINT: 2,
      SIGTERM: 15,
    }

    Object.keys(signals).forEach((signal) => {
      process.on(signal, () => {
        // Already in the process of finishing
        if (zervaNodeProcessDidEndPromise)
          return

        console.log(`\n\n🛑 Zerva: Received a ${signal} signal`)

        stopNode().then(() => {
          // process.exit(128 + (+signals[signal] ?? 0))
          // process.exit(0)
          if (keepAlive) {
            keepAlive.unref()
            clearInterval(keepAlive)
          }
        }).catch((err) => {
          console.error('❌ Zerva: Exit error', err)
        })
      })
    })

    //
    // Sub process running node
    //

    async function stopNode() {
      // console.info('Zerva: stopNode called')

      if (zervaNodeProcessDidEndPromise) {
        await zervaNodeProcessDidEndPromise
      }
      else if (zervaNodeProcess) {
        zervaNodeProcessDidEndPromise = new Promise(resolve => zervaNodeProcessDidEndResolve = resolve)

        if (config.debug)
          console.log('🛑 Zerva: Will stop node process')

        zervaNodeProcess.kill('SIGTERM')
        await zervaNodeProcessDidEndPromise

        if (config.debug)
          console.log('✅ Zerva: Did stop node process\n')
        else
          console.log('🛑 Zerva: Stopped app\n')
      }
      zervaNodeProcessDidEndPromise = undefined
      // console.info('Zerva: stopNode done')
    }

    async function startNode() {
      await stopNode()

      const cwd = process.cwd()

      let spawnExec = process.execPath
      let spawnArgs = [
        '--enable-source-maps',
        ...config.node,
        config.outfile,
      ]

      if (config.bun) {
        spawnExec = 'bun'
        spawnArgs = [
          'run',
          config.outfile,
        ]
      }
      else if (config.deno) {
        spawnExec = 'deno'
        spawnArgs = [
          'run',
          '--allow-read',
          '--allow-write=./',
          '--allow-env',
          config.outfile]
      }

      if (config.debug)
        console.info(`🚀 Zerva: Spawn ${spawnExec} in ${cwd} with args:`, spawnArgs)

      zervaNodeProcess = spawn(
        spawnExec,
        spawnArgs,
        {
          cwd,
          stdio: 'inherit',
          detached: true,
          shell: false,
          killSignal: 'SIGKILL',
          env: {
            ...process.env,
            ZERVA_MODE: 'development',
            ZERVA_VERSION: config.version,
            ZERVA_HTTP_OPEN: String(openBrowser),
          },
        },
      )

      // Only once
      openBrowser = false

      console.info('\n🚀 Zerva: Starting app')
      zervaNodeProcess.on('error', (err) => {
        console.error('❌ Zerva: Node process error:', err)
      })
      zervaNodeProcess.on('close', (code) => {
        console.info('')
        console.info(`💀 Zerva: App ${code !== 0 ? 'crashed' : 'stopped'} (code: ${code})`)
        console.info(`👀 Zerva: Development server watching for changes (Ctrl+C to exit)`)

        if (zervaNodeProcessDidEndResolve)
          zervaNodeProcessDidEndResolve(code ?? 0)
        zervaNodeProcess = undefined
      })
    }

    plugins.push({
      name: 'zerva-rebuild',
      setup(build) {
        build.onStart(stopNode)
        build.onEnd((result) => {
          if (result.errors?.length > 0) {
            console.log(`❌ Build ended with ${result.errors.length} errors`)
            void notifyError(result.errors?.[0])
            return
          }
          try {
            chmodSync(config.outfile, 0o755)
          }
          catch (err) { }

          void startNode()
        })

        build.onDispose(stopNode)
      },
    })
  }

  async function notifyError(error: any) {
    try {
      if (!config.build) {
        // https://www.npmjs.com/package/display-notification
        await displayNotification({
          subtitle: 'Zerva Build Error',
          text: error?.text ?? 'Error',
          sound: 'Bottle',
        } as any)
      }
    }
    catch (err) { }
  }

  function toHumanReadableFilePath(path: string) {
    const p = normalize(path)
    const h = process.env.HOME
    if (h && p.startsWith(h))
      return `~${p.slice(h.length)}`

    return p
  }

  console.info(`🔨 Zerva: Building from "${toHumanReadableFilePath(config.entry)}"`)

  let banner = '/*  Generated by Zerva <https://github.com/holtwick/zerva> */\n'

  if (config.esm) {
    banner += `
// Fix for ESM issues, see https://github.com/evanw/esbuild/issues/1921#issuecomment-1720348876
const require = (await import("node:module")).createRequire(import.meta.url)
const __filename = (await import("node:url")).fileURLToPath(import.meta.url)
const __dirname = (await import("node:path")).dirname(__filename)`
  }

  // Started from command line
  const buildConfig: BuildOptions = {
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: config.esm ? 'esm' : 'cjs',
    entryPoints: [config.entry],
    legalComments: 'none',
    outfile: config.outfile,
    metafile: config.metafile,
    sourcemap: !config.build || config.sourcemap,
    jsxFactory: 'h',
    loader: {
      '.json': 'json',
      ...config.loader,
    },
    plugins,
    banner: {
      js: banner,
    },
    define: {
      // ZERVA_MODE: buildMode ? "production" : "development",
      'ZERVA_DEVELOPMENT': String(!config.build),
      'ZERVA_PRODUCTION': String(config.build),
      'ZERVA_VERSION': `"${config.version}"`,
      'ZERVA_MODE': String(config.mode),
      'process.env.ZERVA_DEVELOPMENT': String(!config.build),
      'process.env.ZERVA_PRODUCTION': String(config.build),
      'process.env.ZERVA_VERSION': `"${config.version}"`,
      'DEBUG': String(valueToBoolean(process.env.DEBUG, false)),
      ...config.define,
    } as any,
    minify: config.build,
    external: config.build
      ? [...DEFAULT_EXCLUDE, ...config.external]
      : [...DEFAULT_EXCLUDE, 'vite', ...config.external],
    ...config.esbuild,
  }

  if (config.debug)
    console.log('build =', buildConfig)

  // https://github.com/evanw/esbuild/blob/main/CHANGELOG.md#0170
  const buildContext = await context(buildConfig)

  if (!config.build) {
    console.info('👀 Zerva: Development server watching for file changes...')
    console.info('🔄 Zerva: The server will automatically restart when you save files.')
    console.info('⌨️  Zerva: Press Ctrl+C to stop the development server.\n')
    await buildContext.watch()
    return
  }

  const result = buildContext.rebuild()
  result
    .then(async (r) => {
      try {
        await chmod(config.outfile, 0o755)
      }
      catch (err) { }

      console.info(`✅ Zerva: Building to "${toHumanReadableFilePath(config.outfile)}" succeeded.`)
      await buildContext.dispose()
    })
    .catch((error: any) => {
      void notifyError(error)
    })
}
