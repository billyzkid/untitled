const childProcess = require("child_process");
const glob = require("glob");
const path = require("path");

glob.sync("../packages/*/", { cwd: __dirname }).forEach((result) => {
  const packageName = path.basename(result);
  childProcess.execSync(`npm unpublish ${packageName} --force`, { stdio: "inherit" });
});
