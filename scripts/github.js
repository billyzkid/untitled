const dotenv = require("dotenv");
const fetch = require("node-fetch");
const packageJson = require("../package.json");

dotenv.config();

const apiEndpoint = "https://api.github.com";
const apiToken = process.env.GITHUB_API_TOKEN;

function request(method, url, pagedData) {
  if (!url.startsWith(apiEndpoint)) {
    url = apiEndpoint + url;
  }

  const headers = {
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": `${packageJson.name}/${packageJson.version}`
  };

  if (apiToken) {
    headers["Authorization"] = `token ${apiToken}`;
  }

  return fetch(url, { method, headers }).then((response) => {
    if (!response.ok) {
      throw new Error(`Request failed with response status ${response.status} (${response.statusText}): ${url}`);
    }

    if (pagedData) {
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
          const linkMatch = link.match(/^<(.*)>; rel="(.*)"$/);
          if (linkMatch && linkMatch[2] === "next") {
            return linkMatch[1];
          } else {
            return nextLink;
          }
        }, null);

        if (nextUrl) {
          return request(method, nextUrl, pagedData);
        } else {
          return pagedData;
        }
      });
    }

    return response.json();
  });
}

function get(url, paged) {
  if (paged) {
    return request("GET", url, []);
  } else {
    return request("GET", url);
  }
}

exports.get = get;