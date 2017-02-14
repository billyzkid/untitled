import spawn from "cross-spawn";

export function execute(script, args) {
  let code;

  switch (script) {
    case "build":
    case "eject":
    case "start":
    case "test": {
      const result = spawn.sync("node", [require.resolve("scripts/" + script)].concat(args), { stdio: "inherit" });

      if (result.signal) {
        console.log(`The script failed because the process exited too early (${result.signal}). This probably means it was killed or the system ran out of memory.`);
        code = 1;
      } else {
        code = result.status;
      }

      break;
    }

    default: {
      console.log(`Unknown script ${script}.`);
      console.log("Perhaps you need to update untitled-scripts?");
      console.log("See: https://github.com/billyzkid/untitled/blob/master/README.md#updating-to-new-releases");

      code = 0;
      break;
    }
  }

  return code;
}