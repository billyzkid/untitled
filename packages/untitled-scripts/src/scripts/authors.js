import fs from "fs";
import os from "os";
import path from "path";
import * as git from "../common/git";
import * as github from "../common/github";

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
    "exclude-pattern"
  ],
  default: {
    "out-file": "./AUTHORS",
    "exclude-pattern": null
  },
  alias: {
    o: "out-file",
    x: "exclude-pattern"
  }
};

const {
  "out-file": outFile,
  "exclude-pattern": excludePattern
} = minimist(args, options);

const eol = os.EOL;
const excludeRegExp = (excludePattern) ? new RegExp(excludePattern) : null;
const validStatusRegExp = /Your branch is up-to-date/;

function getAuthors() {
  const status = git.getStatus(false);

  if (!validStatusRegExp.test(status)) {
    throw new Error("Your `git status` is invalid. Verify your local branch is published and up-to-date.");
  }

  const relativePath = git.getRelativePath(rootPath, currentPath);

  return github.getCommits(relativePath).then((commits) => {
    const authors = commits.reduce((obj, commit) => {
      const key = commit.author.id;

      if (!obj[key]) {
        const { login, html_url } = commit.author;
        const { name, email } = commit.commit.author;

        let text;

        if (name && email) {
          text = `${name} <${email}> (${html_url})`;
        } else if (name) {
          text = `${name} (${html_url})`;
        } else {
          text = `@${login} (${html_url})`;
        }

        obj[key] = { login, html_url, name, email, text };
      }

      return obj;
    }, {});

    return Object.values(authors).sort((a, b) => a.text.localeCompare(b.text)).filter((author) => {
      if (excludeRegExp) {
        return !excludeRegExp.test(author.text);
      } else {
        return true;
      }
    });
  });
}

function writeAuthors(authors) {
  let output = authors.map((author) => author.text).join(eol);

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

getAuthors().then(writeAuthors).catch(handleError);
