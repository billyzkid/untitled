const rimraf = require("rimraf");

process.chdir(__dirname);

rimraf.sync("../packages/*/coverage");
rimraf.sync("../packages/*/lib");
rimraf.sync("../packages/*/node_modules");
rimraf.sync("../packages/*/npm-debug.*");
rimraf.sync("../packages/*/*.log");
rimraf.sync("../coverage");
rimraf.sync("../node_modules");
rimraf.sync("../npm-debug.*");
rimraf.sync("../*.log");
