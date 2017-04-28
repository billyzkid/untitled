const ghScripts = require("gh-scripts");
const main = require("gh-scripts/lib/main");
const authors = require("gh-scripts/lib/commands/authors");
const log = require("gh-scripts/lib/common/log");

log.config({ level: log.level.all });
ghScripts.run(["-h"]);
main.run(["-v"]);
authors.run();
