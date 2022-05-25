const fg = require("fast-glob")
const fs = require("fs")
const { resolve } = require("path")

for (let name of fg.sync("*/**/package.json")) {
  // Skip by path
  if (name.includes("node_modules/")) continue

  console.log(name)
  let content = fs.readFileSync(name, "utf8")
  let package = JSON.parse(content)

  // Skip by name
  if (["@zerva/docker", "@zerva/bin"].includes(package.name)) continue

  if (package.name.startsWith("@zerva/")) {
    package.scripts.reset =
      "rm -rf node_modules pnpm-lock.yaml dist dist_www www"
  }

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

  if (fs.existsSync(resolve(name, "..", "src", "index.ts"))) {
    const hasBrowserCode = fs.existsSync(
      resolve(name, "..", "src", "index.browser.ts")
    )

    const pattern = resolve(name, "..", "**", "*.spec.*")
    const tests = fg.sync(pattern).filter((p) => !p.includes("node_modules/"))
    const hasTests = tests.length > 0

    console.log(
      `  Package ${package.name} browser=${hasBrowserCode} tests=${hasTests}`
    )

    package = {
      ...package,
      ...{
        type: "module",
        exports: {
          ".": {
            browser: hasBrowserCode
              ? "./dist/index.browser.js"
              : "./dist/index.js",
            default: "./dist/index.js",
            node: "./dist/index.js",
            require: "./dist/index.cjs",
          },
        },
        main: "dist/index.cjs",
        module: "dist/index.js",
        typings: "dist/index.d.ts",
        files: ["dist"],
        scripts: {
          build: "pnpm run clean && pnpm run build:tsup",
          "build:tsup": `tsup src/index.ts${
            hasBrowserCode ? " src/index.browser.ts " : ""
          }`,
          clean: "rm -rf dist",
          prepublishOnly: hasTests
            ? "pnpm test && pnpm run build"
            : "pnpm run build",
          start: "pnpm run watch",
          test: hasTests
            ? "ZEED=* vitest --globals --run -r src"
            : "echo 'NO TESTS AVAILABLE'",
          watch: "pnpm run build:tsup -- --watch",
        },
      },
    }
  }

  // Reset for all
  package.scripts.reset = "rm -rf node_modules pnpm-lock.yaml dist dist_www www"

  content = JSON.stringify(package, null, 2)
  fs.writeFileSync(name, content, "utf8")
}