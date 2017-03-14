const childProcess = require("child_process");
const glob = require("glob");
const path = require("path");

function unpublishPackage(package) {
  const packageName = path.basename(package);
  childProcess.execSync(`npm unpublish ${packageName} --force`, { stdio: "inherit" });
}

function handleError(error) {
  console.error(error);
  process.exit(1);
}

glob("../packages/*/", { cwd: __dirname }, (error, packages) => {
  if (!error) {
    packages.forEach(unpublishPackage);
  } else {
    handleError(error);
  }
});