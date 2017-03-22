const fs = require("fs");
const minimist = require("minimist");
const utilities = require("./utilities");
const { EOL: eol } = require("os");

const options = minimist(process.argv.slice(2), {
  string: ["out-file", "exclude-pattern"],
  default: {
    "out-file": "./AUTHORS",
    "exclude-pattern": null
  },
  alias: {
    o: "out-file",
    x: "exclude-pattern"
  }
});

const outFile = options["out-file"];
const excludePattern = options["exclude-pattern"];
const excludeRegExp = (excludePattern) ? new RegExp(excludePattern) : null;

function getAuthors() {
  utilities.checkBranchUpToDate();

  return utilities.getCommits().then((commits) => {
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

    return utilities.values(authors).sort((a, b) => a.text.localeCompare(b.text)).filter((author) => {
      if (excludeRegExp) {
        return !excludeRegExp.test(author.text);
      } else {
        return true;
      }
    });
  });
}

function writeAuthors(authors) {
  // let output = JSON.stringify(authors, null, 2);
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

getAuthors().then(writeAuthors).catch(utilities.handleError);
