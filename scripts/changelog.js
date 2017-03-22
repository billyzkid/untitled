const childProcess = require("child_process");
const fs = require("fs");
const glob = require("glob");
const minimist = require("minimist");
const path = require("path");
const utilities = require("./utilities");
const { EOL: eol } = require("os");

const options = minimist(process.argv.slice(2), {
  string: ["out-file", "exclude-pattern"],
  boolean: ["group-by-release", "group-by-label", "group-by-package"],
  default: {
    "out-file": "./CHANGELOG.md",
    "exclude-pattern": null,
    "group-by-release": true,
    "group-by-label": false,
    "group-by-package": false
  },
  alias: {
    o: "out-file",
    x: "exclude-pattern",
    r: "group-by-release",
    l: "group-by-label",
    p: "group-by-package"
  }
});

const outFile = options["out-file"];
const excludePattern = options["exclude-pattern"];
const groupByRelease = options["group-by-release"];
const groupByLabel = options["group-by-label"];
const groupByPackage = options["group-by-package"];
const extraArgs = options["_"];

const tagRegExp = /tag: ([^,]+)/g;
const issueRegExp = /^Merge pull request #(\d+)[\s\S]+$/;
const excludeRegExp = (excludePattern) ? new RegExp(excludePattern) : null;
const commitHeadingPrefix = (groupByPackage) ? "  - " : "* ";
const commitBodyPrefix = (groupByPackage) ? "    " : "  ";
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
const packagePaths = glob.sync("**/package.json", { ignore: "**/node_modules/**" }).map((result) => path.resolve(path.dirname(result)));
const rootPackageName = (packagePaths.length > 0) ? path.basename(packagePaths[0]) : "";

function getCommits() {
  utilities.checkBranchUpToDate();

  return utilities.getReleases().then((releases) => {
    const revisionRange = extraArgs[0] || "";
    const logCommand = `git log --pretty="%H;%D" --first-parent ${revisionRange} -- .`;
    const logLines = childProcess.execSync(logCommand, { encoding: "utf8" }).split("\n").filter((line) => line);

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

      return utilities.getCommit(sha).then((commit) => {
        const release = releases.find((release) => tags.some((tag) => tag === release.tag_name));
        const issueMatch = commit.commit.message.match(issueRegExp);
        const issueNumber = (issueMatch) ? parseInt(issueMatch[1]) : NaN;

        if (!isNaN(issueNumber)) {
          return utilities.getIssue(issueNumber).then((issue) => {
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
    const { id, login, html_url } = commit.author;
    const { name, email } = commit.commit.author;

    let text;

    if (name && email) {
      text = `${name} <${email}> (@${login})`;
    } else if (name) {
      text = `${name} (@${login})`;
    } else {
      text = `@${login}`;
    }

    obj[id] = { login, html_url, name, email, text };

    return obj;
  }, {});

  return utilities.values(authors);
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

  return utilities.values(groups);
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

  return utilities.values(groups);
}

function groupCommitsByPackage(commits) {
  const groups = commits.reduce((obj, commit) => {
    let packageNames;

    if (commit.files.length > 0) {
      packageNames = commit.files.map((file) => {
        const filePath = path.resolve(__dirname, "..", file.filename);
        const packagePath = packagePaths.slice().reverse().find((packagePath) => filePath.startsWith(packagePath));
        const packageName = (packagePath) ? path.basename(packagePath) : rootPackageName;

        return packageName;
      });
    } else {
      packageNames = [rootPackageName];
    }

    const packages = [...new Set(packageNames)].sort();
    const key = packages.toString();

    if (!obj[key]) {
      obj[key] = { packages, commits: [commit] };
    } else {
      obj[key].commits.push(commit);
    }

    return obj;
  }, {});

  return utilities.values(groups);
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
  // let output = JSON.stringify(commits, null, 2);
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

getCommits().then(writeCommits).catch(utilities.handleError);
