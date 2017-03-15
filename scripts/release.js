const childProcess = require("child_process");
const github = require("./github");
const os = require("os");
const packageJson = require("../package.json");
const path = require("path");
const semver = require("semver");

const eol = os.EOL;
const repo = packageJson.repository;
const packageName = packageJson.name;
const packagesPath = path.resolve(__dirname, "../packages");

const cleanStatusRegExp = /^On branch master\nYour branch is up-to-date with 'origin\/master'.\nnothing to commit, working directory clean\n$/;
const pullRequestMessageRegExp = /^Merge pull request #(\d+)[\s\S]+$/;
const issueNumberRegExp = /(close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved) #(\d+)/gi;
const issueNumberReplacement = `$1 [#$2](https://github.com/${repo}/issues/$2)`;
const newlineRegExp = /\n/g;
const newlineReplacement = "\n    ";
const unlabeledLabel = "___unlabeled___";

const headings = {
  "change: new feature": ":rocket: New Feature",
  "change: breaking change": ":boom: Breaking Change",
  "change: bug fix": ":bug: Bug Fix",
  "change: enhancement": ":nail_care: Enhancement",
  "change: documentation": ":memo: Documentation",
  "change: internal": ":house: Internal",
  [unlabeledLabel]: ":question: Other"
};

function getCommits() {
  const result = childProcess.execSync("git rev-list --first-parent HEAD..", { encoding: "utf8" });
  const promises = result.split("\n").filter((line) => line).map((sha) => {
    return github.get(`/repos/${repo}/commits/${sha}`).then((commit) => {
      const pullRequestMessage = commit.commit.message.match(pullRequestMessageRegExp);
      const issueNumber = (pullRequestMessage) ? pullRequestMessage[1] : null;

      if (issueNumber) {
        return github.get(`/repos/${repo}/issues/${issueNumber}`).then((issue) => { commit.issue = issue; return commit; });
      } else {
        return commit;
      }
    });
  });

  return Promise.all(promises);
}

function groupCommitsByLabel(commits) {
  const labels = Object.keys(headings);
  const groups = commits.reduce((obj, commit) => {
    labels.forEach((label) => {
      const key = label;

      if (key === unlabeledLabel && commit.issue && commit.issue.labels.some((label) => label.name in headings)) {
        return;
      } else if (key !== unlabeledLabel && (!commit.issue || !commit.issue.labels.some((label) => label.name === key))) {
        return;
      }

      if (!obj[key]) {
        obj[key] = { label, commits: [commit] };
      } else {
        obj[key].commits.push(commit);
      }
    });

    return obj;
  }, {});

  return Object.keys(groups).sort((a, b) => labels.indexOf(a) - labels.indexOf(b)).map((key) => groups[key]);
}

function groupCommitsByPackages(commits) {
  const groups = commits.reduce((obj, commit) => {
    const packageNames = (commit.files.length > 0) ? commit.files.map((file) => {
      const filePath = path.resolve(file.filename);

      if (filePath.startsWith(packagesPath)) {
        return filePath.slice(packagesPath.length + 1).split(path.sep, 1)[0];
      } else {
        return packageName;
      }
    }) : [packageName];

    const packages = [...new Set(packageNames)].sort();
    const key = packages.toString();

    if (!obj[key]) {
      obj[key] = { packages, commits: [commit] };
    } else {
      obj[key].commits.push(commit);
    }

    return obj;
  }, {});

  return Object.keys(groups).sort().map((key) => groups[key]);
}

function formatCommits(commits) {
  let markdown = "";

  groupCommitsByLabel(commits).forEach((obj) => {
    const labelHeading = headings[obj.label];

    markdown += `${eol}### ${labelHeading}${eol}`;

    groupCommitsByPackages(obj.commits).forEach((obj) => {
      const packagesHeading = obj.packages.map((package) => `\`${package}\``).join(", ");

      markdown += `${eol}* ${packagesHeading}${eol}`;

      obj.commits.forEach((commit) => {
        const commitHeading = (commit.issue) ? `[#${commit.issue.number}](${commit.issue.html_url}) - ${commit.issue.title.replace(issueNumberRegExp, issueNumberReplacement).replace(newlineRegExp, newlineReplacement).trim()} ([@${commit.author.login}](${commit.author.html_url}))` : `${commit.commit.message.replace(issueNumberRegExp, issueNumberReplacement).replace(newlineRegExp, newlineReplacement).trim()} ([@${commit.author.login}](${commit.author.html_url}))`
        const commitBody = (commit.issue) ? commit.issue.body.replace(issueNumberRegExp, issueNumberReplacement).replace(newlineRegExp, newlineReplacement).trim() : null;

        markdown += `${eol}  * ${commitHeading}${eol}`;

        if (commitBody) {
          markdown += `${eol}    ${commitBody}${eol}`;
        }
      });
    });
  });

  return markdown.trim();
}

function checkStatus() {
  const status = childProcess.execSync("git status", { encoding: "utf8" });

  if (!cleanStatusRegExp.test(status)) {
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
  const prerelease = !!semver.parse(version).prerelease.length;

  // Silly comment to remove

  getCommits().then(formatCommits).then((body) => {
    // https://developer.github.com/v3/repos/releases/#create-a-release
    const content = {
      tag_name: tag,
      name,
      body,
      prerelease
    };

    return github.post(`/repos/${repo}/releases`, content);
  });
}

function handleError(error) {
  console.error(error);
  process.exit(1);
}

try {
  //checkStatus();
  //publishPackages();
  //updateAuthors();
  //updateChangelog();
  createRelease();
} catch (error) {
  handleError(error);
}
