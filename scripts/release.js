// const childProcess = require("child_process");
// const semver = require("semver");

// function validateStatus() {
//   const status = git.getStatus(false);

//   if (!/Your branch is up-to-date/.test(status)) {
//     throw new Error("Your `git status` is invalid. Verify your local branch is published and up-to-date.");
//   }
// }

// function updateAuthors() {
//   childProcess.execSync("npm run authors", { stdio: "inherit" });
// }

// function updateChangelogs() {
//   childProcess.execSync("npm run changelog", { stdio: "inherit" });
// }

// function publishPackages() {
//   childProcess.execSync("npm run publish", { stdio: "inherit" });
// }

// function getReleaseBody() {
//   return github.getLatestRelease().then((release) => {
//     let command = "npm run changelog -- --no-out-file";

//     if (release) {
//       command += ` ${release.tag_name}..`;
//     }

//     return childProcess.execSync(command, { encoding: "utf8" });
//   });
// }

// function createRelease() {
//   const version = require("../lerna.json").version;
//   const tag = `v${version}`;
//   const commitish = "master";
//   const name = `Release ${tag}`;
//   const draft = false;
//   const prerelease = !!semver.parse(version).prerelease.length;

//   return getReleaseBody().then((body) => github.createRelease(tag, commitish, name, body, draft, prerelease));
// }

// validateStatus();
// updateAuthors();
// updateChangelogs();
// publishPackages();
// createRelease();
