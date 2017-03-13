const github = require("./github");
const minimist = require("minimist");
const packageJson = require("../package.json");
const utilities = require("./utilities");

const args = process.argv.slice(2);
const options = minimist(args);

const repo = options.repo || packageJson.repository;
const tag = options["tag"];

// if (!tag) {
//   throw new Error("Tag required.");
// }

function checkStatus() {
  return utilities.exec("git status --porcelain", { encoding: "utf8" }).then((status) => {
    if (status) {
      //throw new Error("Your git status is not clean.");
    }
  });
}

function updateAuthors() {
  return utilities.exec("npm run authors", { encoding: "utf8" });
}

function updateChangelog() {
  return utilities.exec("npm run changelog", { encoding: "utf8" });
}

function createRelease() {
}

// 1. Check git status (git status --porcelain)
// 2. Update AUTHORS (npm run authors)
// 3. Update CHANGELOG (npm run changelog)
// 4. Publish (npm run publish)
// 5. Create tagged release with title/description from changelog

checkStatus()
  .then(() => updateAuthors())
  .then(() => updateChangelog())
  .then(() => publish())
  .catch((error) => console.error(error));