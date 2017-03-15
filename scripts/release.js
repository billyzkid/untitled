const childProcess = require("child_process");
const github = require("./github");
const inquirer = require("inquirer");
const minimist = require("minimist");
const packageJson = require("../package.json");
const path = require("path");
const semver = require("semver");

const args = process.argv.slice(2);
const options = minimist(args);

const repo = packageJson.repository;
const currentVersion = packageJson.version;

function gitPull() {
  childProcess.execSync("git pull");
}

function gitStatus() {
  const status = childProcess.execSync("git status --porcelain", { encoding: "utf8" });

  if (status) {
    throw new Error("Your git status is not clean.");
  }
}

function publishPackages() {
  const cwd = path.resolve(__dirname, "../node_modules/.bin");
  childProcess.execSync("lerna publish --skip-git --skip-npm", { cwd, stdio: "inherit" });
}

function updateAuthors() {
  childProcess.execSync("npm run authors", { stdio: "inherit" });
}

function updateChangelog() {
  childProcess.execSync("npm run changelog", { stdio: "inherit" });
}

function createRelease() {
  const version = require("../lerna.json").version;
  const tag = `v${version}`;
  const name = `Release ${tag}`;
  const body = `Release ${tag}`;
  const draft = false;
  const prerelease = !!semver.parse(version).prerelease.length;

  // https://developer.github.com/v3/repos/releases/#create-a-release
  const content = {
    tag_name: tag,
    name,
    body,
    draft,
    prerelease
  };

  return github.post(`/repos/${repo}/releases`, content);
}

function handleError(error) {
  console.error(error);
  process.exit(1);
}

try {
  //gitPull();
  //gitStatus();
  //publishPackages();



  //updateAuthors();
  //updateChangelog();

  createRelease();
} catch (error) {
  handleError(error);
}
