const fetch = require("node-fetch");
const fs = require("fs");
const minimist = require("minimist");
const packageJson = require("../package.json");

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
      throw new Error(`Request failed with response status ${response.status} (${response.statusText}): ${url}`);
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

function format(type, data) {
  switch (type) {
    case "json":
      return formatJson(data);
    case "text":
      return formatText(data);
    default:
      throw new Error(`Unknown format: ${type}`);
  }
}

function formatJson(data) {
  return JSON.stringify(data, null, 2);
}

function formatText(data) {
  return data.map((c) => {
    const name = (c.user && c.user.name) ? c.user.name : c.login;
    const email = (c.user && c.user.email) ? c.user.email : null;
    const url = (c.user && c.user.html_url) ? c.user.html_url : c.html_url;

    if (email && url) {
      return `${name} <${email}> (${url})`;
    } else if (email) {
      return `${name} <${email}>`;
    } else if (url) {
      return `${name} (${url})`;
    } else {
      return `${name}`;
    }
  }).sort().join("\n");
}

const options = minimist(process.argv.slice(2), {
  default: {
    "format": "text",
    "out-file": ""
  }
});

get(`/repos/${repo}/contributors`, true).then((data) => {
  const promises = data.filter((c) => c.url).map((c) => get(c.url).then((u) => c.user = u));
  return Promise.all(promises).then(() => data);
}).then((data) => {
  const output = format(options.format, data);
  if (options["out-file"]) {
    fs.writeFileSync(options["out-file"], output);
  } else {
    console.log(output);
  }
}).catch((error) => {
  console.error(error);
});