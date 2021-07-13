const esbuild = require("esbuild")
const pkg = require("./package.json")

module.exports = {
  // https://jestjs.io/docs/en/troubleshooting#caching-issues
  getCacheKey() {
    return Math.random().toString()
  },

  process(content, filename) {
    let result = esbuild.buildSync({
      sourcemap: "inline",
      write: false,
      bundle: true,
      target: "es2015",
      platform: "node",
      external: [
        ...Object.keys(pkg.dependencies ?? {}).filter(
          (d) => !d.includes("lib")
        ),
        ...Object.keys(pkg.devDependencies ?? {}),
        ...Object.keys(pkg.peerDependencies ?? {}),
      ],
      entryPoints: [filename],
    })

    return new TextDecoder("utf-8").decode(result.outputFiles[0].contents)
  },
}
