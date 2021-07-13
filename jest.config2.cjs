module.exports = {
  transform: {
    "^.+\\.[t]sx?$": "./jest.cjs",
  },
  testEnvironment: "node",
  // testPathIgnorePatterns: ["node_modules/", "dist/", "/_depr", "/public"],
  moduleDirectories: ["node_modules"],
}
