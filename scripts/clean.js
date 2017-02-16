const rimraf = require("rimraf");

process.chdir(__dirname);

rimraf.sync("../packages/*/build");
rimraf.sync("../packages/*/coverage");
rimraf.sync("../packages/*/node_modules");
rimraf.sync("../packages/*/*.log");
rimraf.sync("../coverage");
rimraf.sync("../node_modules");
rimraf.sync("../*.log");