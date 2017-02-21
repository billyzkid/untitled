const childProcess = require("child_process");
const fs = require("fs");
const minimist = require("minimist");
const mkdirp = require("mkdirp");
const packageJson = require("../package.json");
const path = require("path");

process.chdir(__dirname);

// GitHub repository name
const repository = packageJson.repository;

if (!repository) {
  throw new Error("Missing GitHub repository");
}

// GitHub API token (see https://github.com/settings/tokens)
// const githubApiToken = "4e295f0e9e0ebc7089a9f8d3204d0832c09ac6d2";
const githubApiToken = process.env.GITHUB_API_TOKEN;

// Optional directory for caching API responses to avoid throttling
// const cacheDir = "../.changelog";
const cacheDir = "";

// Optional list of ignored committers (exact or partial match), e.g. bot agents
const ignoredCommitters = [];

// Issue/PR labels mapped to headers in CHANGELOG.md
const labels = {
  "new feature": ":rocket: New Feature",
  "breaking change": ":boom: Breaking Change",
  "bug fix": ":bug: Bug Fix",
  "enhancement": ":nail_care: Enhancement",
  "documentation": ":memo: Documentation",
  "internal": ":house: Internal"
};

const unreleasedTag = "___unreleased___";

function execSync(command) {
  return childProcess.execSync(command, { encoding: "utf8" }).trim();
}

function defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }

  return obj;
}

class ApiDataCache {
  constructor(host) {
    this.host = host;
    this.dir = cacheDir && path.join(cacheDir, host);

    if (this.dir) {
      try {
        mkdirp.sync(this.dir);
      } catch (error) {
        throw new Error(`Can't use cacheDir "${cacheDir}" (${error.message})`);
      }
    }
  }

  get(type, key) {
    if (!this.dir) return;

    try {
      return fs.readFileSync(this.fn(type, key), "utf-8");
    } catch (error) {
      // Ignore
    }
  }

  set(type, key, data) {
    if (!this.dir) return;
    return fs.writeFileSync(this.fn(type, key), data);
  }

  fn(type, key) {
    const dir = path.join(this.dir, type);
    mkdirp.sync(dir);
    return path.join(dir, key);
  }
}

class GithubApi {
  constructor() {
    this.cache = new ApiDataCache("github");
  }

  getIssueData(issue) {
    return this._get("issue", issue);
  }

  getUserData(login) {
    return this._get("user", login);
  }

  _get(type, key) {
    let data = this.cache.get(type, key);

    if (!data) {
      data = this._fetch(type, key);
      this.cache.set(type, key, data);
    }

    return JSON.parse(data);
  }

  _fetch(type, key) {
    const url = {
      issue: `https://api.github.com/repos/${repository}/issues/${key}`,
      user: `https://api.github.com/users/${key}`
    }[type];

    if (githubApiToken) {
      return execSync(`curl --silent --globoff -H \"Authorization: token ${githubApiToken}\" ${url}`);
    } else {
      return execSync(`curl --silent --globoff ${url}`);
    }
  }
}

class RemoteRepo {
  constructor() {
    this.api = new GithubApi();
  }

  getLabels() {
    return Object.keys(labels);
  }

  getHeadingForLabel(label) {
    return labels[label];
  }

  getBaseIssueUrl() {
    return `https://github.com/${repository}/issues/`;
  }

  getBasePullRequestUrl() {
    return `https://github.com/${repository}/pull/`;
  }

  getIssueData(issue) {
    return this.api.getIssueData(issue);
  }

  getUserData(login) {
    return this.api.getUserData(login);
  }
}

class Changelog {
  constructor(options) {
    this.remote = new RemoteRepo();
    this.tagFrom = options["tag-from"];
    this.tagTo = options["tag-to"];
  }

  createMarkdown() {
    let markdown = "\n";

    const commitsInfo = this.getCommitsInfo();
    const commitsByTag = this.getCommitsByTag(commitsInfo);

    Object.keys(commitsByTag).forEach((tag) => {
      const commitsForTag = commitsByTag[tag].commits;
      const commitsByCategory = this.getCommitsByCategory(commitsForTag);
      const committers = this.getCommitters(commitsForTag);

      const hasCommitsForCurrentTag = commitsByCategory.some((category) => category.commits.length > 0);
      if (!hasCommitsForCurrentTag) return;

      const releaseTitle = (tag === unreleasedTag) ? "Unreleased" : tag;
      markdown += "## " + releaseTitle + " (" + commitsByTag[tag].date + ")";

      commitsByCategory.filter((category) => category.commits.length > 0).forEach((category) => {
        const commitsByPackage = category.commits.reduce(
          (acc, commit) => {
            const changedPackages = this.getListOfUniquePackages(commit.commitSHA);
            const heading = changedPackages.length > 0 ? "* " + changedPackages.map((pkg) => "`" + pkg + "`").join(", ") : "* Other";
            const existingCommitsForHeading = acc[heading] || [];

            // es6 ==> return { ...acc, [heading]: existingCommitsForHeading.concat(commit) };
            return Object.assign({}, acc, defineProperty({}, heading, existingCommitsForHeading.concat(commit)));
          }, {});

        markdown += "\n";
        markdown += "\n";
        markdown += "#### " + category.heading;

        Object.keys(commitsByPackage).forEach((heading) => {
          markdown += "\n" + heading;

          commitsByPackage[heading].forEach((commit) => {
            markdown += "\n  * ";

            if (commit.number) {
              const prUrl = this.remote.getBasePullRequestUrl() + commit.number;
              markdown += "[#" + commit.number + "](" + prUrl + ") ";
            }

            commit.title = commit.title.replace(/(fix|close|resolve)(e?s|e?d)? [T#](\d+)/i, "Closes [#$3](" + this.remote.getBaseIssueUrl() + "$3)");
            markdown += commit.title + "." + " ([@" + commit.user.login + "](" + commit.user.html_url + "))";
          });
        });
      });

      markdown += "\n\n#### Committers: " + committers.length + "\n";
      markdown += committers.map((committer) => "- " + committer).join("\n");
      markdown += "\n\n\n";
    });

    return markdown.substring(0, markdown.length - 3);
  }

  getListOfUniquePackages(sha) {
    return Object.keys(execSync("git show -m --name-only --pretty=\"format:\" --first-parent " + sha).split("\n").reduce((acc, files) => {
      if (files.indexOf("packages/") === 0) {
        acc[files.slice(9).split("/", 1)[0]] = true;
      }
      return acc;
    }, {}));
  }

  getListOfTags() {
    const tags = execSync("git tag");

    if (tags) {
      return tags.split("\n");
    }

    return [];
  }

  getLastTag() {
    try {
      return execSync("git describe --abbrev=0 --tags 2> nul");
    } catch (error) {
      return undefined;
    }
  }

  getListOfCommits() {
    const tagFrom = this.tagFrom || this.getLastTag() || "";
    const tagTo = this.tagTo || "";
    const tagsRange = (tagFrom || tagTo) ? tagFrom + ".." + tagTo : "";
    const commits = execSync("git log --oneline --pretty=\"%h;%D;%s;%cd\" --date=short " + tagsRange);

    if (commits) {
      return commits.split("\n");
    }

    return [];
  }

  getCommitters(commits) {
    const committers = {};

    commits.forEach((commit) => {
      const login = (commit.user || {}).login;
      const keepCommitter = login && (!ignoredCommitters || !ignoredCommitters.some((c) => c === login || login.indexOf(c) > -1));

      if (login && keepCommitter && !committers[login]) {
        const user = this.remote.getUserData(login);
        const userNameAndLink = `[${login}](${user.html_url})`;

        if (user.name) {
          committers[login] = `${user.name} (${userNameAndLink})`;
        } else {
          committers[login] = userNameAndLink;
        }
      }
    });

    return Object.keys(committers).map((key) => committers[key]).sort();
  }

  getCommitsInfo() {
    const commits = this.getListOfCommits();
    const allTags = this.getListOfTags();

    const commitsInfo = commits.map((commit) => {
      const parts = commit.split(";");
      const sha = parts[0];
      const refs = parts[1];

      let tagsInCommit;
      if (refs.length > 1) {
        tagsInCommit = allTags.reduce((acc, tag) => {
          if (refs.indexOf(tag) < 0) {
            return acc;
          } else {
            return acc.concat(tag);
          }
        }, []);
      }

      const message = parts[2];
      const date = parts[3];
      const mergeCommit = message.match(/\(#(\d+)\)$/);

      const commitInfo = {
        commitSHA: sha,
        message: message,
        labels: [],
        tags: tagsInCommit,
        date
      };

      if (message.indexOf("Merge pull request ") === 0 || mergeCommit) {
        let issueNumber;
        if (message.indexOf("Merge pull request ") === 0) {
          const start = message.indexOf("#") + 1;
          const end = message.slice(start).indexOf(" ");
          issueNumber = message.slice(start, start + end);
        } else {
          issueNumber = mergeCommit[1];
        }

        const response = this.remote.getIssueData(issueNumber);
        response.commitSHA = sha;
        response.mergeMessage = message;

        Object.assign(commitInfo, response);
      }

      return commitInfo;
    });

    return commitsInfo;
  }

  getCommitsByTag(commits) {
    let currentTags = [unreleasedTag];

    return commits.reduce((acc, commit) => {
      if (commit.tags && commit.tags.length > 0) {
        currentTags = commit.tags;
      }

      const commitsForTags = currentTags.reduce((acc2, currentTag) => {
        let existingCommitsForTag = [];
        if ({}.hasOwnProperty.call(acc, currentTag)) {
          existingCommitsForTag = acc[currentTag].commits;
        }

        let releaseDate = this.getToday();
        if (currentTag !== unreleasedTag) {
          releaseDate = acc[currentTag] ? acc[currentTag].date : commit.date;
        }

        // es6 ==> return { ...acc2, [currentTag]: { date: releaseDate, commits: existingCommitsForTag.concat(commit) } };
        return Object.assign({}, acc2, defineProperty({}, currentTag, { date: releaseDate, commits: existingCommitsForTag.concat(commit) }));
      }, {});

      // es6 ==> return { ...acc, ...commitsForTags };
      return Object.assign({}, acc, commitsForTags);
    }, {});
  }

  getCommitsByCategory(commits) {
    return this.remote.getLabels().map((label) => ({
      heading: this.remote.getHeadingForLabel(label),
      commits: commits.reduce((acc, commit) => {
        if (commit.labels.some((commitLabel) => commitLabel.name.toLowerCase() === label.toLowerCase())) {
          return acc.concat(commit);
        } else {
          return acc;
        }
      }, [])
    }));
  }

  getToday() {
    const date = new Date().toISOString();
    return date.slice(0, date.indexOf("T"));
  }
}

const args = process.argv.slice(2);
const options = minimist(args);
const changelog = new Changelog(options);
const markdown = changelog.createMarkdown();

console.log(markdown);