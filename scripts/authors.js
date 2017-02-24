const fs = require("fs");
const github = require("./github");
const minimist = require("minimist");
const packageJson = require("../package.json");

const options = minimist(process.argv.slice(2), {
  default: {
    "repo": packageJson.repository,
    "format": "text",
    "out-file": ""
  }
});

const repo = options.repo;
const format = options.format;
const outputFile = options["out-file"];

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

github.get(`/repos/${repo}/contributors`, true).then((data) => {
  const promises = data.filter((c) => c.url).map((c) => github.get(c.url).then((u) => c.user = u));
  return Promise.all(promises).then(() => data);
}).then((data) => {
  switch (format) {
    case "json":
      return formatJson(data);
    case "text":
      return formatText(data);
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