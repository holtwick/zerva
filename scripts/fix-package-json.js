const fg = require("fast-glob")
const fs = require("fs")

for (let name of fg.sync("*/**/package.json")) {
  // Skit by path
  if (name.includes("node_modules/")) continue

  console.log(name)
  let content = fs.readFileSync(name, "utf8")
  let package = JSON.parse(content)

  // Skip by name
  if (["@zerva/docker"].includes(package.name)) continue

  delete package.engines

  package = {
    ...package,
    ...{
      author: {
        name: "Dirk Holtwick",
        email: "dirk.holtwick@gmail.com",
        url: "https://holtwick.de",
      },
      funding: {
        type: "GitHub Sponsors ❤",
        url: "https://github.com/sponsors/holtwick",
      },
      license: "MIT",
    },
  }

  // if (name.startsWith("zerva-") && !name.startsWith("zerva-bin/")) {
  // json = {
  //   ...json,
  //   ...{
  //     scripts: {
  //       start: "pnpm run watch",
  //       build: "pnpm run clean && pnpm run build:tsup",
  //       "build:tsup":
  //         "tsup src/index.ts src/index.browser.ts --dts --sourcemap --format esm,cjs",
  //       watch: "pnpm run build:tsup -- --watch",
  //       check: "tsc --noEmit -p tsconfig.json",
  //       clean: "rm -rf dist",
  //       prepublish: "pnpm test && pnpm run build",
  //       test: "vitest -r src --globals",
  //     },
  //     author: {
  //       name: "Dirk Holtwick",
  //       url: "https://holtwick.de",
  //     },
  //     type: "module",
  //     typings: "dist/index.d.ts",
  //     exports: {
  //       ".": {
  //         browser: "./dist/index.browser.js",
  //         require: "./dist/index.cjs",
  //         node: "./dist/index.js",
  //         default: "./dist/index.js",
  //       },
  //     },
  //     module: "dist/index.js",
  //     main: "dist/index.cjs",
  //     files: ["dist"],
  //   },

  content = JSON.stringify(package, null, 2)
  fs.writeFileSync(name, content, "utf8")
}
