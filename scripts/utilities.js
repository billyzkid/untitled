const childProcess = require("child_process");

function exec(command, options) {
  return new Promise((resolve, reject) => {
    childProcess.exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}

function ignoreError(error) {
}

function handleError(error) {
  console.error(error);
  process.exit(1);
}

exports.exec = exec;
exports.ignoreError = ignoreError;
exports.handleError = handleError;