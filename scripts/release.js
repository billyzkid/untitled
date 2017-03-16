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

const labels = Object.keys(headings);

function getCommits(tagFrom, tagTo) {
  let tagRange;

  if (tagFrom && tagTo) {
    tagRange = `${tagFrom}..${tagTo}`;
  } else if (tagFrom) {
    tagRange = `${tagFrom}..`;
  } else if (tagTo) {
    tagRange = `${tagTo}`;
  } else {
    tagRange = "";
  }

  const shas = childProcess.execSync(`git log --pretty="%H" --first-parent ${tagRange}`, { encoding: "utf8" }).split("\n").filter((line) => line);
  const promises = shas.map((sha) => {
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

function getContributors(commits) {
  const urls = commits.filter((commit) => commit.author).map((commit) => commit.author.url);
  const promises = [...new Set(urls)].map((url) => github.get(url));

  return Promise.all(promises);
}

function groupCommitsByLabel(commits) {
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

function getLatestRelease() {
  return github.get(`/repos/${repo}/releases/latest`).then(null, (error) => null);
}

function createRelease() {
  const version = require("../lerna.json").version;
  const tag = `v${version}`;
  const name = `Release ${tag}`;
  const prerelease = !!semver.parse(version).prerelease.length;

  return getLatestRelease().then((latestRelease) => {
    if (latestRelease) {
      return getCommits(latestRelease.tag_name);
    } else {
      return getCommits();
    }
  }).then((commits) => {
    return getContributors(commits).then((contributors) => {
      let markdown = "";

      groupCommitsByLabel(commits).forEach((obj) => {
        const labelHeading = headings[obj.label];

        markdown += `#### ${labelHeading} (${obj.commits.length})${eol}${eol}`;

        groupCommitsByPackages(obj.commits).forEach((obj) => {
          const packagesHeading = obj.packages.map((package) => `\`${package}\``).join(", ");

          markdown += `* ${packagesHeading}${eol}${eol}`;

          obj.commits.forEach((commit, index) => {
            const commitHeading = (commit.issue) ? `[#${commit.issue.number}](${commit.issue.html_url}) - ${commit.issue.title.replace(issueNumberRegExp, issueNumberReplacement).replace(newlineRegExp, newlineReplacement).trim()} ([@${commit.author.login}](${commit.author.html_url}))` : `${commit.commit.message.replace(issueNumberRegExp, issueNumberReplacement).replace(newlineRegExp, newlineReplacement).trim()} ([@${commit.author.login}](${commit.author.html_url}))`
            const commitBody = (commit.issue) ? commit.issue.body.replace(issueNumberRegExp, issueNumberReplacement).replace(newlineRegExp, newlineReplacement).trim() : null;

            if (commitHeading && commitBody) {
              markdown += `  * ${commitHeading}${eol}    <p>${commitBody}</p>${eol}${eol}`;
            } else if (index === obj.commits.length - 1) {
              markdown += `  * ${commitHeading}${eol}${eol}`;
            } else {
              markdown += `  * ${commitHeading}${eol}`;
            }
          });
        });
      });

      if (contributors.length > 0) {
        markdown += `#### Contributors (${contributors.length})${eol}${eol}`;

        contributors.sort((a, b) => {
          const stringA = (a.name) ? `${a.name} (@${a.login})` : `@${a.login}`;
          const stringB = (b.name) ? `${b.name} (@${b.login})` : `@${b.login}`;

          return stringA.localeCompare(stringB);
        }).forEach((contributor) => {
          const { name, login, html_url } = contributor;

          if (name) {
            markdown += `* ${name} ([@${login}](${html_url}))${eol}`;
          } else {
            markdown += `* [@${login}](${html_url})${eol}`;
          }
        });
      }

      return markdown.trim();
    });
  }).then((body) => {
    return github.post(`/repos/${repo}/releases`, { tag_name: tag, name, body, prerelease });
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
