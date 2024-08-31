import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { files } from 'zeed'

async function main() {
  const { default: sortPackageJson } = await import('sort-package-json')

  const fileNames = files({ pattern: 'zerva-*/package.json' })

  for (const name of fileNames) { // sync(['!**/node_modules', '*/package.json'])) {
    // Skip by path
    if (name.includes('node_modules/'))
      continue

    console.log('')
    console.log(name)

    let content = readFileSync(name, 'utf8')
    let pkg = JSON.parse(content)

    // Skip by name
    if (['@zerva/docker', '@zerva/bin'].includes(pkg.name))
      continue

    if (pkg.name.startsWith('@zerva/')) {
      pkg.scripts.reset = 'rm -rf node_modules pnpm-lock.yaml dist dist_www www'
    }

    delete pkg.engines
    delete pkg.sideEffects

    pkg = {
      ...pkg,
      ...{
        // sideEffects: false,
        author: {
          name: 'Dirk Holtwick',
          email: 'dirk.holtwick@gmail.com',
          url: 'https://holtwick.de',
        },
        funding: {
          type: 'GitHub Sponsors ❤',
          url: 'https://github.com/sponsors/holtwick',
        },
        license: 'MIT',
      },
    }

    if (existsSync(resolve(name, '..', 'src', 'index.ts'))) {
      const hasBrowserCode = existsSync(
        resolve(name, '..', 'src', 'index.browser.ts'),
      )

      const pattern = resolve(name, '..', '**', '*.spec.*')
      const tests = sync(['!**/node_modules', pattern])
      const hasTests = tests.length > 0

      console.log(`  Package ${pkg.name} browser=${hasBrowserCode} tests=${hasTests}`)

      const tsup = `tsup src/index.ts${hasBrowserCode ? ' src/index.browser.ts ' : ''
        }`

      pkg = {
        ...pkg,
        ...{
          type: 'module',
          exports: {
            '.': {
              browser: hasBrowserCode
                ? './dist/index.browser.js'
                : './dist/index.js',
              // node: './dist/index.js',
              require: './dist/index.cjs',
              default: './dist/index.js',
            },
          },
          main: 'dist/index.cjs',
          module: 'dist/index.js',
          typings: 'dist/index.d.ts',
          files: ['dist'],
          scripts: {
            'build': 'pnpm run clean && pnpm run build:tsup',
            'build:tsup': tsup,
            'prepublishOnly': hasTests
              ? 'pnpm test && pnpm run build'
              : 'pnpm run build',
            'release':
              'pnpm test && pnpm version patch && pnpm build && pnpm publish --no-git-checks',
            'start': 'pnpm run watch',
            'test': hasTests
              ? 'ZEED=* vitest --globals --run -r src'
              : 'echo \'NO TESTS AVAILABLE\'',
            'watch': `${tsup} --watch`,
            'check': 'vue-tsc --noEmit --skipLibCheck -p ./tsconfig.json',
            'clean': 'rm -rf dist www',
            'reset': 'rm -rf dist www node_modules pnpm-lock.yaml .out*',
            'lint': 'eslint .',
            'lint:fix': 'eslint . --fix',
            'dbld': 'zerva demo/zerva.ts --build && ZEED=* ZEED_COLOR=1 node dist/main.mjs',
            'drun': 'ZEED=* ZEED_COLOR=1 zerva demo/zerva.ts',
          },
          engines: {
            node: '>=18.0.0',
          },
        },
      }
    }

    // Reset for all
    pkg.scripts.reset = 'rm -rf node_modules pnpm-lock.yaml dist dist_www www'

    pkg = sortPackageJson(pkg)
    content = `${JSON.stringify(pkg, null, 2)}\n` // trailing \n also from pnpm etc.
    // writeFileSync(name, content, 'utf8')
  }
}

main()
