const fetch = require("node-fetch");
const packageJson = require("../package.json");

process.chdir(__dirname);

const apiEndpoint = "https://api.github.com";
const apiToken = process.env.GITHUB_API_TOKEN;
const userAgent = packageJson.name;
const repo = packageJson.repository;

function request(method, url) {
  if (!url.startsWith(apiEndpoint)) {
    url = apiEndpoint + url;
  }

  const headers = {
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": userAgent
  };

  if (apiToken) {
    headers["Authorization"] = `token ${apiToken}`;
  }

  return fetch(url, { method, headers }).then((response) => {
    if (!response.ok) {
      throw new Error(`Request failed with response: ${response.status} (${response.statusText})`);
    }

    return response;
  });
}

function get(url, paged, items = []) {
  return request("GET", url).then((response) => {
    if (!paged) {
      return response.json();
    } else {
      return response.json().then((data) => {
        if (data instanceof Array) {
          items.push(...data);
        } else if (data.items instanceof Array) {
          items.push(...data.items);
        } else {
          throw new Error("Unexpected response data");
        }

        const linkHeader = response.headers.get("link");
        const links = (linkHeader) ? linkHeader.split(", ") : [];
        const nextUrl = links.reduce((nextLink, link) => {
          const matches = link.match(/^<(.*)>; rel="(.*)"$/);
          if (matches && matches[2] === "next") {
            return matches[1];
          } else {
            return nextLink;
          }
        }, null);

        if (nextUrl) {
          return get(nextUrl, paged, items);
        } else {
          return items;
        }
      });
    }
  });
}

get(`/repos/${repo}/contributors`, true).then((data) => {
  console.log(data);
}).catch((error) => {
  console.error(error);
});