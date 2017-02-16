const dotenv = require("dotenv");
const Changelog = require("lerna-changelog").Changelog;

process.chdir(__dirname);

dotenv.config({
  path: "../.env"
});

const changelog = new Changelog();
const markdown = changelog.createMarkdown();

console.log(markdown);