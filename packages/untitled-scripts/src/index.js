#!/usr/bin/env node

import spawn from "cross-spawn";

const script = process.argv[2];
const args = process.argv.slice(3);

switch (script) {
  case "build":
  case "eject":
  case "start":
  case "test": {
    const result = spawn.sync("node", [require.resolve("scripts/" + script)].concat(args), { stdio: "inherit" });

    if (result.signal === "SIGKILL") {
      console.log("The build failed because the process exited too early. This probably means the system ran out of memory or someone called `kill -9` on the process.");
      process.exit(1);
    } else if (result.signal === "SIGTERM") {
      console.log("The build failed because the process exited too early. Someone might have called `kill` or `killall`, or the system could be shutting down.");
      process.exit(1);
    } else {
      process.exit(result.status);
    }

    break;
  }

  default: {
    console.log(`Unknown script ${script}.`);
    console.log("Perhaps you need to update untitled-scripts?");
    console.log("See: https://github.com/billyzkid/untitled/blob/master/README.md#updating-to-new-releases");
    break;
  }
}