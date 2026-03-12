import type { Options } from 'tsdown'

export const tsdown: Options = {
  sourcemap: true,
  clean: true,
  dts: true,
  format: ['esm', 'cjs'],
  minify: true,
  splitting: true,
  treeshake: true,
  skipNodeModulesBundle: true,
  // noExternal: [/^(?!(zeed|@zerva\/|better-sqlite3|vite)).*$/gim],
  target: 'es2020',
  outDir: 'dist',
  loader: {
    '.css': 'text',
    '.html': 'text',
  },
}
