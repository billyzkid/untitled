import crossSpawn from "cross-spawn";

/**
 * Runs the specified script.
 * @param {string} script The name of the script to run.
 * @param {string[]} [args] The optional arguments passed to the script.
 * @returns {number} The exit code.
 */
function run(script, ...args) {
  switch (script) {
    case "build":
    case "eject":
    case "start":
    case "test": {
      const scriptPath = require.resolve(`./scripts/${script}`);
      const result = crossSpawn.sync("node", [scriptPath].concat(...args), { stdio: "inherit" });

      if (result.signal) {
        console.error(`Script "${script}" failed (${result.signal})`);
        return 1;
      } else {
        return result.status;
      }
    }

    default: {
      console.warn(`Unknown script "${script}"`);
      return 0;
    }
  }
}

export {
  run
};
