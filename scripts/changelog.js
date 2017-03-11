const childProcess = require("child_process");
const fs = require("fs");
const github = require("./github");
const minimist = require("minimist");
const packageJson = require("../package.json");
const path = require("path");

const args = process.argv.slice(2);
const options = minimist(args);

const repo = options.repo || packageJson.repository;
const format = options.format || "markdown";
const outputFile = options["out-file"] || "./CHANGELOG.md";
const packageDir = options["pkg-dir"] || "./packages";
const packageName = options["pkg-name"] || packageJson.name;
const tagFrom = options["tag-from"];
const tagTo = options["tag-to"];

const unreleasedTag = "___unreleased___";
const unlabeledLabel = "___unlabeled___";

const headings = {
  "new feature": ":rocket: New Feature",
  "breaking change": ":boom: Breaking Change",
  "bug fix": ":bug: Bug Fix",
  "enhancement": ":nail_care: Enhancement",
  "documentation": ":memo: Documentation",
  "internal": ":house: Internal",
  [unlabeledLabel]: ":question Other"
};

function exec(command, options) {
  return new Promise((resolve, reject) => {
    childProcess.exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}

function getCommits() {
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

  return exec(`git log --pretty="%H;%an;%cI;%s;%D" --first-parent ${tagRange}`, { encoding: "utf8" }).then((result) => {
    const promises = [];
    const tags = [];
    const tagPrefix = "tag: ";

    const commits = result.split("\n").filter((line) => line).map((line) => {
      const [sha, author, date, subject, refs] = line.split(";");
      const refTags = refs.split(", ").filter((ref) => ref.startsWith(tagPrefix)).map((ref) => ref.slice(tagPrefix.length));

      if (refTags.length > 0) {
        tags.length = 0;
        tags.push(...refTags);
      }

      const releaseTag = (tags.length > 0) ? tags[0] : null;
      const release = null;

      const issueNumberMatch = subject.match(/^Merge pull request #(\d+)/);
      const issueNumber = (issueNumberMatch) ? parseInt(issueNumberMatch[1]) : null;
      const issue = null;

      return { sha, author, date, subject, refs, releaseTag, release, issueNumber, issue };
    });

    promises.push(...commits.map((commit) => {
      return exec(`git show -m --name-only --pretty="format:" --first-parent ${commit.sha}`, { encoding: "utf8" }).then((result) => commit.files = result.split("\n").filter((line) => line));
    }));

    promises.push(...commits.filter((commit) => commit.releaseTag).map((commit) => {
      return github.get(`/repos/${repo}/releases/tags/${commit.releaseTag}`).then((release) => commit.release = release);
    }));

    promises.push(...commits.filter((commit) => commit.issueNumber).map((commit) => {
      return github.get(`/repos/${repo}/issues/${commit.issueNumber}`).then((issue) => commit.issue = issue);
    }));

    return Promise.all(promises).then(() => commits);
  });
}

function getCommitsByRelease(commits) {
  commits = commits.reduce((obj, commit) => {
    const release = commit.release;
    const key = (release) ? release.tag_name : unreleasedTag;

    if (!obj[key]) {
      obj[key] = { release, commits: [commit] };
    } else {
      obj[key].commits.push(commit);
    }

    return obj;
  }, {});

  return Object.keys(commits).map((key) => commits[key]);
}

function getCommitsByLabel(commits) {
  commits = commits.reduce((obj, commit) => {
    Object.keys(headings).forEach((key) => {
      if (key === unlabeledLabel && commit.issue && commit.issue.labels.some((label) => label.name in headings)) {
        return;
      } else if (key !== unlabeledLabel && (!commit.issue || !commit.issue.labels.some((label) => label.name === key))) {
        return;
      }

      if (!obj[key]) {
        obj[key] = { label: key, commits: [commit] };
      } else {
        obj[key].commits.push(commit);
      }
    });

    return obj;
  }, {});

  return Object.keys(commits).map((key) => commits[key]);
}

function getCommitsByPackages(commits) {
  commits = commits.reduce((obj, commit) => {
    const packages = getPackages(commit);
    const key = packages.toString();

    if (!obj[key]) {
      obj[key] = { packages, commits: [commit] };
    } else {
      obj[key].commits.push(commit);
    }

    return obj;
  }, {});

  return Object.keys(commits).sort().map((key) => commits[key]);
}

function getPackages(commit) {
  const packagePath = path.resolve(packageDir);
  const packages = (commit.files.length > 0) ? commit.files.map((file) => {
    const filePath = path.resolve(file);

    if (filePath.startsWith(packagePath)) {
      return filePath.slice(packagePath.length + 1).split(path.sep, 1)[0];
    } else {
      return packageName;
    }
  }) : [packageName];

  return [...new Set(packages)];
}

function formatJson(commits) {
  return JSON.stringify(commits, null, 2);
}

function formatMarkdown(commits) {
  let markdown = "# Changelog";
  const commitsByRelease = getCommitsByRelease(commits);

  commitsByRelease.forEach((obj) => {
    const releaseHeading = (obj.release) ? `${obj.release.name.trim()} - ${new Date(obj.release.published_at).toDateString()}` : "Unreleased";
    const releaseBody = (obj.release) ? obj.release.body.trim() : "The following commits have not been tagged with a release."
    const commitsByLabel = getCommitsByLabel(obj.commits);

    markdown += `\n\n## ${releaseHeading}`;

    if (releaseBody) {
      markdown += `\n\n> ${releaseBody}`;
    }

    commitsByLabel.forEach((obj) => {
      const labelHeading = headings[obj.label];
      const commitsByPackages = getCommitsByPackages(obj.commits);

      markdown += `\n\n### ${labelHeading}`;

      commitsByPackages.forEach((obj) => {
        const packagesHeading = obj.packages.map((package) => `\`${package}\``).join(", ");

        markdown += `\n\n* ${packagesHeading}`;

        obj.commits.forEach((commit) => {
          const commitHeading = (commit.issue) ? `[#${commit.issue.number}](${commit.issue.html_url}) - ${commit.issue.title.trim()} ([@${commit.issue.user.login}](${commit.issue.user.html_url}))` : `${commit.subject.trim()} (${commit.author})`
          const commitBody = (commit.issue) ? commit.issue.body.trim() : null;

          markdown += `\n\n  * ${commitHeading.replace(/\n/g, "\n    ")}`;

          if (commitBody) {
            markdown += `\n\n    ${commitBody.replace(/\n/g, "\n    ")}`;
          }
        });
      });
    });
  });

  return markdown;
}

getCommits().then((commits) => {
  switch (format) {
    case "json":
      return formatJson(commits);
    case "markdown":
      return formatMarkdown(commits);
    default:
      throw new Error(`Unknown format: ${format}`);
  }
}).then((output) => {
  if (outputFile) {
    fs.writeFileSync(outputFile, output);
  } else {
    console.log(output);
  }
}).catch((error) => {
  console.error(error);
});