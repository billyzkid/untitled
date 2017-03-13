const github = require("./github");
const minimist = require("minimist");
const packageJson = require("../package.json");
const utilities = require("./utilities");

const args = process.argv.slice(2);
const options = minimist(args);

const repo = options.repo || packageJson.repository;
const tag = options["tag"];

if (!tag) {
  throw new Error("Tag required.");
}

function createRelease() {
}

  // 1. Check git status (git status --porcelain)
  // 2. Update AUTHORS (npm run authors)
  // 3. Update CHANGELOG (npm run changelog)
  // 4. Commit changes
  // 5. Publish (npm run publish)
  // 6. Create tagged release with title/description from changelog

createRelease().then((release) => {

}).catch((error) => {
  console.error(error);
});