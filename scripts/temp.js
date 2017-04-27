const ghScripts = require("gh-scripts").default;
const main = require("gh-scripts/lib/main").default;
const authors = require("gh-scripts/lib/commands/authors").default;
const log = require("gh-scripts/lib/common/log").default;

log.config({ level: log.level.all });
ghScripts.run(["-h"]);
main.run(["-v"]);
authors.run();
