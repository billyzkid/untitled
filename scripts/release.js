const childProcess = require("child_process");
const github = require("./github");
const inquirer = require("inquirer");
const minimist = require("minimist");
const packageJson = require("../package.json");
const semver = require("semver");

const args = process.argv.slice(2);
const options = minimist(args);

const repo = packageJson.repository;
const currentVersion = packageJson.version;

function checkStatus() {
  const status = childProcess.execSync("git status --porcelain", { encoding: "utf8" });

  if (status) {
    //throw new Error("Your git status is not clean.");
  }
}

function promptVersion() {
  const patch = semver.inc(currentVersion, "patch");
  const minor = semver.inc(currentVersion, "minor");
  const major = semver.inc(currentVersion, "major");
  const prepatch = semver.inc(currentVersion, "prepatch");
  const preminor = semver.inc(currentVersion, "preminor");
  const premajor = semver.inc(currentVersion, "premajor");

  return inquirer.prompt([{
    type: "list",
    name: "choice",
    message: `Select a new version (currently ${currentVersion}):`,
    choices: [
      { value: patch, name: `Patch (${patch})` },
      { value: minor, name: `Minor (${minor})` },
      { value: major, name: `Major (${major})` },
      { value: prepatch, name: `Prepatch (${prepatch})` },
      { value: preminor, name: `Preminor (${preminor})` },
      { value: premajor, name: `Premajor (${premajor})` },
      { value: "PRERELEASE", name: "Prerelease" },
      { value: "CUSTOM", name: "Custom" }
    ],
    pageSize: 8
  }]).then((answers) => {
    switch (answers.choice) {

      case "PRERELEASE": {
        const components = semver.prerelease(currentVersion);
        const existingId = (components && components.length === 2) ? components[0] : null;
        const defaultValue = (existingId) ? `"${existingId}"` : "none";
        const defaultVersion = semver.inc(currentVersion, "prerelease", existingId);

        return inquirer.prompt([{
          type: "input",
          name: "input",
          message: `Enter a prerelease identifier (default: ${defaultValue}, yielding ${defaultVersion})`,
          filter: (v) => semver.inc(currentVersion, "prerelease", (v) ? v : existingId)
        }]).then((answers) => answers.input);
      }

      case "CUSTOM": {
        return inquirer.prompt([{
          type: "input",
          name: "input",
          message: "Enter a custom version",
          filter: (v) => semver.valid(v),
          validate: (v) => semver.valid(v) ? true : "Must be a valid semver version"
        }]).then((answers) => answers.input);
      }

      default: {
        return answers.choice;
      }
    }
  });
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
  process.exit(1);
}

promptVersion().then((version) => {
  console.log(version);
  checkStatus();
  updateAuthors();
  updateChangelog();
  //publishPackages();
}).catch(handleError);
