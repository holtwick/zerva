const fs = require('node:fs')
const { resolve } = require('node:path')
const fg = require('fast-glob')

async function main() {
  const { default: sortPackageJson } = await import('sort-package-json')

  for (const name of fg.sync(['!**/node_modules', '*/**/package.json'])) {
    // Skip by path
    if (name.includes('node_modules/'))
      continue

    console.log('')
    console.log(name)

    let content = fs.readFileSync(name, 'utf8')
    let package = JSON.parse(content)

    // Skip by name
    if (['@zerva/docker', '@zerva/bin'].includes(package.name))
      continue

    if (package.name.startsWith('@zerva/')) {
      package.scripts.reset
        = 'rm -rf node_modules pnpm-lock.yaml dist dist_www www'
    }

    delete package.engines
    delete package.sideEffects

    package = {
      ...package,
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

    if (fs.existsSync(resolve(name, '..', 'src', 'index.ts'))) {
      const hasBrowserCode = fs.existsSync(
        resolve(name, '..', 'src', 'index.browser.ts'),
      )

      const pattern = resolve(name, '..', '**', '*.spec.*')
      const tests = fg.sync(['!**/node_modules', pattern])
      const hasTests = tests.length > 0

      console.log(
        `  Package ${package.name} browser=${hasBrowserCode} tests=${hasTests}`,
      )

      const tsup = `tsup src/index.ts${hasBrowserCode ? ' src/index.browser.ts ' : ''
        }`

      package = {
        ...package,
        ...{
          type: 'module',
          exports: {
            '.': {
              browser: hasBrowserCode
                ? './dist/index.browser.js'
                : './dist/index.js',
              default: './dist/index.js',
              node: './dist/index.js',
              require: './dist/index.cjs',
            },
          },
          main: 'dist/index.cjs',
          module: 'dist/index.js',
          typings: 'dist/index.d.ts',
          files: ['dist'],
          scripts: {
            'build': 'pnpm run clean && pnpm run build:tsup',
            'build:tsup': tsup,
            'clean': 'rm -rf dist',
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
            'check': 'vue-tsc --noEmit -p ./tsconfig.json',
            'clean': 'rm -rf dist www',
            'lint': 'eslint .',
            'lint:fix': 'eslint . --fix',
          },
        },
      }
    }

    // Reset for all
    package.scripts.reset
      = 'rm -rf node_modules pnpm-lock.yaml dist dist_www www'

    package = sortPackageJson(package)
    content = `${JSON.stringify(package, null, 2)}\n` // trailing \n also from pnpm etc.
    fs.writeFileSync(name, content, 'utf8')
  }
}

main()
