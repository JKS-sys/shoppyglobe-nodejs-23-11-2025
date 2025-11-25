module.exports = {
  testEnvironment: "node",
  testTimeout: 10000,
  detectOpenHandles: true,
  forceExit: true,
  collectCoverageFrom: [
    "**/*.js",
    "!**/node_modules/**",
    "!**/coverage/**",
    "!**/jest.config.js",
  ],
};
