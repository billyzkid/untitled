const childProcess = require("child_process");
const dotenv = require("dotenv");
const fetch = require("node-fetch");
const packageJson = require("../package.json");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const githubApiToken = process.env.GITHUB_API_TOKEN;
const githubApiEndpoint = "https://api.github.com";
const githubUserAgent = `${packageJson.name}/${packageJson.version}`;
const githubRepo = packageJson.repository;
const githubLinkRegExp = /^<(.*)>; rel="(.*)"$/;
const statusBranchUpToDateRegExp = /Your branch is up-to-date/;
const newlineRegExp = /\n/g;

function values(obj) {
  return Object.keys(obj).map((key) => obj[key]);
}

function indent(str, size) {
  const space = " ".repeat(size);
  const newlineReplacement = `\n${space}`;

  return str.replace(newlineRegExp, newlineReplacement);
}

function sendGithubRequest(method, url, content, pagedData) {
  if (!url.startsWith(githubApiEndpoint)) {
    url = githubApiEndpoint + url;
  }

  const headers = {
    "User-Agent": githubUserAgent,
    "Accept": "application/vnd.github.v3+json"
  };

  if (githubApiToken) {
    headers["Authorization"] = `token ${githubApiToken}`;
  }

  if (method === "POST" || method === "PATCH" || method === "PUT" || method === "DELETE") {
    headers["Content-Type"] = "application/json";
  }

  if (method === "PUT" && !body) {
    headers["Content-Length"] = 0;
  }

  let body;

  if (content) {
    body = JSON.stringify(content);
  }

  return fetch(url, { method, headers, body }).then((response) => {
    if (!response.ok) {
      throw new Error(`Request failed with response status ${response.status} (${response.statusText}): ${url}`);
    }

    if (!pagedData) {
      return response.json();
    } else {
      return response.json().then((data) => {
        if (data instanceof Array) {
          pagedData.push(...data);
        } else if (data.items instanceof Array) {
          pagedData.push(...data.items);
        } else {
          throw new Error("Unexpected response data");
        }

        const linkHeader = response.headers.get("link");
        const links = (linkHeader) ? linkHeader.split(", ") : [];

        const nextUrl = links.reduce((nextLink, link) => {
          const linkMatch = link.match(githubLinkRegExp);
          if (linkMatch && linkMatch[2] === "next") {
            return linkMatch[1];
          } else {
            return nextLink;
          }
        }, null);

        if (nextUrl) {
          return sendGithubRequest(method, nextUrl, content, pagedData);
        } else {
          return pagedData;
        }
      });
    }
  });
}

function getIssue(number) {
  return sendGithubRequest("GET", `/repos/${githubRepo}/issues/${number}`);
}

function getCommit(sha) {
  return sendGithubRequest("GET", `/repos/${githubRepo}/commits/${sha}`);
}

function getCommits() {
  return sendGithubRequest("GET", `/repos/${githubRepo}/commits`, null, []);
}

function getReleases() {
  return sendGithubRequest("GET", `/repos/${githubRepo}/releases`, null, []);
}

function createRelease(tag, name, body, draft, prerelease) {
  return sendGithubRequest("POST", `/repos/${githubRepo}/releases`, { tag_name: tag, name, body, draft, prerelease });
}

function getStatus() {
  return childProcess.execSync("git status", { encoding: "utf8" });
}

function checkBranchUpToDate() {
  const status = getStatus();

  if (!statusBranchUpToDateRegExp.test(status)) {
    throw new Error("Your branch is not up-to-date");
  }
}

function handleError(error) {
  process.stderr.write(`${error.stack}\n`);
  process.exit(1);
}

exports.values = values;
exports.indent = indent;
exports.getIssue = getIssue;
exports.getCommit = getCommit;
exports.getCommits = getCommits;
exports.getReleases = getReleases;
exports.createRelease = createRelease;
exports.checkBranchUpToDate = checkBranchUpToDate;
exports.handleError = handleError;
