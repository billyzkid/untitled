import fs from "fs";
import os from "os";
import path from "path";
import * as git from "../common/git";
import * as github from "../common/github";
import * as utilities from "../common/utilities";

// package dependencies
import "babel-polyfill";
import dotenv from "dotenv";
import minimist from "minimist";

const rootPath = git.getRepositoryPath();
const currentPath = process.cwd();
const args = process.argv.slice(2);

const options = {
  string: [
    "out-file",
    "packages-dir",
    "exclude-pattern"
  ],
  boolean: [
    "group-by-release",
    "group-by-label",
    "group-by-package"
  ],
  default: {
    "out-file": "./CHANGELOG.md",
    "packages-dir": "./packages",
    "exclude-pattern": null,
    "group-by-release": true,
    "group-by-label": false,
    "group-by-package": false
  },
  alias: {
    o: "out-file",
    d: "packages-dir",
    x: "exclude-pattern",
    r: "group-by-release",
    l: "group-by-label",
    p: "group-by-package"
  }
};

const {
  "_": extraArgs,
  "out-file": outFile,
  "packages-dir": packagesDir,
  "exclude-pattern": excludePattern,
  "group-by-release": groupByRelease,
  "group-by-label": groupByLabel,
  "group-by-package": groupByPackage
} = minimist(args, options);

const eol = os.EOL;
const excludeRegExp = (excludePattern) ? new RegExp(excludePattern) : null;
const validStatusRegExp = /Your branch is up-to-date/;
const tagRegExp = /tag: ([^,]+)/g;
const issueRegExp = /^Merge pull request #(\d+)[\s\S]+$/;
const unreleasedTag = "__unreleased__";
const unlabeledLabel = "__unlabeled__";

const headings = {
  "change: new feature": ":rocket: New Features",
  "change: breaking change": ":boom: Breaking Changes",
  "change: bug fix": ":bug: Bug Fixes",
  "change: polish": ":nail_care: Polish",
  "change: documentation": ":memo: Documentation",
  "change: housekeeping": ":house: Housekeeping",
  [unlabeledLabel]: ":question: Other"
};

const labels = Object.keys(headings);

function getCommits() {
  const status = git.getStatus(false);

  if (!validStatusRegExp.test(status)) {
    throw new Error("Your `git status` is invalid. Verify your local branch is published and up-to-date.");
  }

  return github.getReleases().then((releases) => {
    const revisionRange = (extraArgs.length > 0) ? extraArgs[0] : null;
    const paths = path.relative(rootPath, currentPath) ? "." : null;
    const log = git.getLog(revisionRange, paths);
    const logLines = log.split("\n").filter((line) => line);

    let currentTags;

    return Promise.all(logLines.map((line) => {
      const [sha, refs] = line.split(";");
      const tags = [];

      let tagMatch = tagRegExp.exec(refs);

      if (tagMatch) {
        do {
          tags.push(tagMatch[1]);
          tagMatch = tagRegExp.exec(refs);
        } while (tagMatch);
        currentTags = tags;
      } else if (currentTags) {
        tags.push(...currentTags);
      }

      return github.getCommit(sha).then((commit) => {
        const release = releases.find((release) => tags.some((tag) => tag === release.tag_name));
        const issueMatch = commit.commit.message.match(issueRegExp);
        const issueNumber = (issueMatch) ? parseInt(issueMatch[1]) : NaN;

        if (!isNaN(issueNumber)) {
          return github.getIssue(issueNumber).then((issue) => {
            const text = `#${issue.number} - ${issue.title.trim()} (@${commit.author.login})\n\n${issue.body.trim()}`;
            return Object.assign(commit, { issue, release, text });
          });
        } else {
          const text = `${commit.commit.message.trim()} (@${commit.author.login})`;
          return Object.assign(commit, { release, text });
        }
      });
    })).then((commits) => commits.filter((commit) => {
      if (excludeRegExp) {
        return !excludeRegExp.test(commit.text);
      } else {
        return true;
      }
    }));
  });
}

function getAuthors(commits) {
  const authors = commits.reduce((obj, commit) => {
    const key = commit.author.id;

    if (!obj[key]) {
      const { login, html_url } = commit.author;
      const { name, email } = commit.commit.author;

      let text;

      if (name && email) {
        text = `${name} <${email}> (@${login})`;
      } else if (name) {
        text = `${name} (@${login})`;
      } else {
        text = `@${login}`;
      }

      obj[key] = { login, html_url, name, email, text };
    }

    return obj;
  }, {});

  return Object.values(authors);
}

function groupCommitsByRelease(commits) {
  const groups = commits.reduce((obj, commit) => {
    const release = commit.release;
    const key = (release) ? release.tag_name : unreleasedTag;

    if (!obj[key]) {
      obj[key] = { release, commits: [commit] };
    } else {
      obj[key].commits.push(commit);
    }

    return obj;
  }, {});

  return Object.values(groups);
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

  return Object.values(groups);
}

function groupCommitsByPackage(commits) {
  const packagesPath = path.resolve(packagesDir);
  const defaultPackageName = path.basename(currentPath);

  const groups = commits.reduce((obj, commit) => {
    const packageNames = (commit.files.length > 0) ? commit.files.map((file) => {
      const filePath = path.resolve(rootPath, file.filename);

      if (filePath.startsWith(packagesPath)) {
        return filePath.slice(packagesPath.length + 1).split(path.sep, 1)[0];
      } else {
        return defaultPackageName;
      }
    }) : [defaultPackageName];

    const packages = utilities.getUniqueValues(packageNames).sort();
    const key = packages.toString();

    if (!obj[key]) {
      obj[key] = { packages, commits: [commit] };
    } else {
      obj[key].commits.push(commit);
    }

    return obj;
  }, {});

  return Object.values(groups);
}

function formatCommits1(commits) {
  let markdown = "";

  if (groupByRelease) {
    groupCommitsByRelease(commits).forEach((obj) => {
      const releaseHeading = (obj.release) ? obj.release.name.trim() : "Unreleased";
      const releaseBody = (obj.release) ? new Date(obj.release.published_at).toUTCString() : new Date().toUTCString();
      const releaseCommits = obj.commits;

      if (releaseHeading && releaseBody) {
        markdown += `## ${releaseHeading}${eol}> ${releaseBody}${eol}${eol}`;
      } else {
        markdown += `## ${releaseHeading}${eol}${eol}`;
      }

      markdown += formatCommits2(releaseCommits);
      markdown += formatCommits5(releaseCommits);
    });
  } else {
    markdown += formatCommits2(commits);
    markdown += formatCommits5(commits);
  }

  return markdown;
}

function formatCommits2(commits) {
  let markdown = `### Commits (${commits.length})${eol}${eol}`;

  if (groupByLabel) {
    groupCommitsByLabel(commits).sort((a, b) => labels.indexOf(a.label) - labels.indexOf(b.label)).forEach((obj) => {
      const labelHeading = headings[obj.label];
      const labelCommits = obj.commits;

      markdown += `#### ${labelHeading}${eol}${eol}`;
      markdown += formatCommits3(labelCommits);
    });
  } else {
    markdown += formatCommits3(commits);
  }

  return markdown;
}

function formatCommits3(commits) {
  let markdown = "";

  if (groupByPackage) {
    groupCommitsByPackage(commits).sort((a, b) => a.packages.join(", ").localeCompare(b.packages.join(", "))).forEach((obj) => {
      const packageHeading = obj.packages.map((name) => `\`${name}\``).join(", ");
      const packageCommits = obj.commits;

      markdown += `* ${packageHeading}${eol}${eol}`;
      markdown += formatCommits4(packageCommits);
    });
  } else {
    markdown += formatCommits4(commits);
  }

  return markdown;
}

function formatCommits4(commits) {
  let markdown = "";

  const commitHeadingPrefix = (groupByPackage) ? "  - " : "* ";
  const commitBodyPrefix = (groupByPackage) ? "    " : "  ";

  commits.forEach((commit, index, array) => {
    const commitHeading = (commit.issue) ? `[#${commit.issue.number}](${commit.issue.html_url}) - ${commit.issue.title.trim()} ([@${commit.author.login}](${commit.author.html_url}))` : `${commit.commit.message.trim()} ([@${commit.author.login}](${commit.author.html_url}))`;
    const commitBody = (commit.issue) ? commit.issue.body.trim() : null;

    if (commitBody) {
      markdown += `${commitHeadingPrefix}${utilities.indent(commitHeading, commitHeadingPrefix.length)}${eol}${eol}${commitBodyPrefix}${utilities.indent(commitBody, commitBodyPrefix.length)}${eol}${eol}`;
    } else if (index === array.length - 1) {
      markdown += `${commitHeadingPrefix}${utilities.indent(commitHeading, commitHeadingPrefix.length)}${eol}${eol}`;
    } else {
      markdown += `${commitHeadingPrefix}${utilities.indent(commitHeading, commitHeadingPrefix.length)}${eol}`;
    }
  });

  return markdown;
}

function formatCommits5(commits) {
  const contributors = getAuthors(commits).sort((a, b) => a.text.localeCompare(b.text)).map((author) => {
    const { login, html_url, name, email } = author;

    if (name && email) {
      return `${name} \\<${email}> ([@${login}](${html_url}))`;
    } else if (name) {
      return `${name} ([@${login}](${html_url}))`;
    } else {
      return `[@${login}](${html_url})`;
    }
  });

  let markdown = `### Contributors (${contributors.length})${eol}${eol}`;

  contributors.forEach((contributor, index, array) => {
    if (index === array.length - 1) {
      markdown += `* ${contributor}${eol}${eol}`;
    } else {
      markdown += `* ${contributor}${eol}`;
    }
  });

  return markdown;
}

function writeCommits(commits) {
  // let output = utilities.getPrettyJsonString(commits);
  let output = formatCommits1(commits).trim();

  if (output) {
    output += eol;
  }

  if (outFile) {
    fs.writeFileSync(outFile, output);
  } else {
    process.stdout.write(output);
  }
}

function handleError(error) {
  process.stderr.write(`${error.stack}\n`);
  process.exit(1);
}

dotenv.config({ path: path.resolve(rootPath, ".env") });
github.config({ token: process.env.GITHUB_API_TOKEN });

getCommits().then(writeCommits).catch(handleError);