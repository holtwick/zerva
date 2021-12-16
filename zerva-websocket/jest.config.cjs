module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  testPathIgnorePatterns: ["/node_modules/", "/demos/"],
  resolver: "jest-ts-webcompat-resolver",
}
