const combine = require("istanbul-combine");

process.chdir(__dirname);

combine.sync({
  dir: "../coverage",
  pattern: "../packages/*/coverage/coverage-final.json",
  print: "summary",
  reporters: {
    clover: {},
    lcov: {},
    json: {}
  }
});