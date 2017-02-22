const GitHub = require("github-base");
const packageJson = require("../package.json");

process.chdir(__dirname);

const repo = packageJson.repository;
const options = { token: process.env.GITHUB_API_TOKEN };
const github = new GitHub(options);

github.paged(`/repos/:${repo}/contributors`, function (error, data) {
  if (error) {
    console.log(error);
  } else {
    console.log(data);
  }
});