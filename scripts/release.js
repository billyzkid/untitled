const childProcess = require("child_process");
const github = require("./github");
const minimist = require("minimist");
const packageJson = require("../package.json");
const utilities = require("./utilities");

const args = process.argv.slice(2);
const options = minimist(args);

const repo = options.repo || packageJson.repository;
const version = options["version"] || packageJson.version;

if (!version) {
  throw new Error("Version required.");
}

function checkStatus() {
  const status = childProcess.execSync("git status --porcelain", { encoding: "utf8" });

  if (status) {
    throw new Error("Your git status is not clean.");
  }
}

function updateAuthors() {
  childProcess.execSync("npm run authors", { stdio: "inherit" });
}

function updateChangelog() {
  childProcess.execSync("npm run changelog", { stdio: "inherit" });
}

function publishPackages() {
  childProcess.execSync("npm run publish", { stdio: "inherit" });
}

function createRelease() {
  // See https://developer.github.com/v3/repos/releases/#create-a-release
  const content = {
    "tag_name": "v0.0.6",
    "target_commitish": "master",
    "name": "Test Release v0.0.6",
    "body": "The body of the release...",
    "draft": false,
    "prerelease": false
  };

  return github.post(`/repos/${repo}/releases`, content);
}

function handleError(error) {
  console.error(error);
  //process.exit(1);
}

try {
  checkStatus();
  updateAuthors();
  updateChangelog();
  publishPackages();
} catch (error) {
  handleError(error);
}
