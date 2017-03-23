import * as git from "./git";

// package dependencies
import fetch from "node-fetch";

const pageLinkRegExp = /^<(.*)>; rel="(.*)"$/;

const options = {
  token: null,
  endpoint: "https://api.github.com",
  repository: git.getRepositoryName()
};

function sendRequest(method, url, content, pageData) {
  let body;

  if (content) {
    body = JSON.stringify(content);
  }

  const headers = {
    "User-Agent": options.repository,
    "Accept": "application/vnd.github.v3+json"
  };

  if (options.token) {
    headers["Authorization"] = `token ${options.token}`;
  }

  if (method === "POST" || method === "PATCH" || method === "PUT" || method === "DELETE") {
    headers["Content-Type"] = "application/json";
  }

  if (method === "PUT" && !body) {
    headers["Content-Length"] = 0;
  }

  return fetch(url, { method, body, headers }).then((response) => {
    if (!response.ok) {
      throw new Error(`Request failed with response status ${response.status} (${response.statusText}): ${url}`);
    }

    if (!pageData) {
      return response.json();
    } else {
      return response.json().then((data) => {
        if (data instanceof Array) {
          pageData.push(...data);
        } else if (data.items instanceof Array) {
          pageData.push(...data.items);
        } else {
          throw new Error("Unexpected response data");
        }

        const linkHeader = response.headers.get("link");
        const links = (linkHeader) ? linkHeader.split(", ") : [];

        const nextPageUrl = links.reduce((pageUrl, link) => {
          const pageLinkMatch = link.match(pageLinkRegExp);

          if (pageLinkMatch && pageLinkMatch[2] === "next") {
            return pageLinkMatch[1];
          } else {
            return pageUrl;
          }
        }, null);

        if (nextPageUrl) {
          return sendRequest(method, nextPageUrl, content, pageData);
        } else {
          return pageData;
        }
      });
    }
  });
}

function config(obj) {
  Object.assign(options, obj);
}

function getIssue(number) {
  const url = `${options.endpoint}/repos/${options.repository}/issues/${number}`;

  return sendRequest("GET", url, null, null);
}

function getCommit(sha) {
  const url = `${options.endpoint}/repos/${options.repository}/commits/${sha}`;

  return sendRequest("GET", url, null, null);
}

function getCommits(path) {
  let url = `${options.endpoint}/repos/${options.repository}/commits?per_page=100`;

  if (path) {
    url += `&path=${path}`;
  }

  return sendRequest("GET", url, null, []);
}

function getReleases() {
  const url = `${options.endpoint}/repos/${options.repository}/releases?per_page=100`;

  return sendRequest("GET", url, null, []);
}

function createRelease(tag, commitish, name, body, draft, prerelease) {
  const url = `${options.endpoint}/repos/${options.repository}/releases`;
  const content = { tag_name: tag, target_commitish: commitish, name, body, draft, prerelease };

  return sendRequest("POST", url, content, null);
}

export {
  config,
  getIssue,
  getCommit,
  getCommits,
  getReleases,
  createRelease
};
