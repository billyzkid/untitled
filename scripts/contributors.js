const packageJson = require("../package.json");
const requestPromise = require("request-promise");

process.chdir(__dirname);

const githubApiHost = "https://api.github.com";
const githubApiToken = process.env.GITHUB_API_TOKEN;
const githubRepo = packageJson.repository;

function request(method, uri) {
  if (uri.indexOf("//") === -1) {
    uri = githubApiHost + uri;
  }

  const headers = {
    "User-Agent": "Untitled"
  };

  if (githubApiToken) {
    headers["Authorization"] = `token ${githubApiToken}`;
  }

  const options = {
    method,
    uri,
    headers,
    json: true,
    resolveWithFullResponse: true
  };

  return requestPromise(options);
}

function get(uri, paged) {
  if (!paged) {
    return request("GET", uri);
  } else {
    const body = arguments[2] || [];
    return request("GET", uri).then((response) => {
      if (response.body instanceof Array) {
        body.push(...response.body);
      } else if (response.body.items instanceof Array) {
        body.push(...response.body.items);
      } else {
        throw new Error("Unexpected response body");
      }

      if (response.headers.link) {
        const links = response.headers.link.split(",");
        const nextUri = links.reduce((nextLink, link) => {
          const matches = link.match(/^<(.*)>; rel="(.*)"$/);

          if (matches && matches[2] === "next") {
            return matches[1];
          } else {
            return nextLink;
          }
        }, undefined);

        if (nextUri) {
          return get(nextUri, paged, body);
        }
      }

      response.body = body;
      return response;
    });
  }
}

get(`/repos/${githubRepo}/contributors`, true).then((response) => {
  console.log(response.body);
}).catch((error) => {
  console.error(error);
});