import type { Options } from 'tsup'

export const tsup: Options = {
  sourcemap: true,
  clean: true,
  dts: true,
  format: ['esm', 'cjs'],
  minify: true,
  splitting: true,
  treeshake: true,
  bundle: true,
  skipNodeModulesBundle: true,
  // noExternal: [/^(?!(zeed|@zerva\/|better-sqlite3|vite)).*$/gim],
  target: 'es2020',
  outDir: 'dist',
  loader: {
    '.css': 'text',
    '.html': 'text',
  },
}
