import type { Options } from 'tsup'

import pkg from './package.json'

export const tsup: Options = {
  sourcemap: true,
  clean: true,
  dts: true,
  format: ['esm', 'cjs'],
  minify: false,
  splitting: true,
  bundle: true,
  skipNodeModulesBundle: true,
  entryPoints: ['src/index.all.ts'],
  noExternal: Object.keys(pkg.devDependencies),
  target: 'es2020',
  outDir: 'dist',
  entry: ['src/**/*.ts'],
  loader: {
    '.css': 'text',
    '.html': 'text',
  },
}
