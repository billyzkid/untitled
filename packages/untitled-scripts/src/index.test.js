import crossSpawn from "cross-spawn";
import glob from "glob";
import path from "path";
import * as index from "./index";

jest.mock("cross-spawn");

describe("run", () => {
  const successResult = { status: 0 };
  const failureResult = { signal: "SIGTERM", status: 1 };

  const scripts = glob.sync("./scripts/*.js", { cwd: __dirname }).reduce((obj, result) => {
    const key = path.basename(result, ".js");
    const value = require.resolve(result);

    obj[key] = value;

    return obj;
  }, {});

  Object.keys(scripts).forEach((script) => {
    const scriptPath = scripts[script];

    test(`should run script "${script}" with expected success result`, () => {
      crossSpawn.sync = jest.fn(() => successResult);
      console.error = jest.fn();

      const code = index.run(script, "--foo", "--bar");

      expect(code).toBe(successResult.status);
      expect(crossSpawn.sync).toHaveBeenCalledTimes(1);
      expect(crossSpawn.sync).toHaveBeenCalledWith("node", [scriptPath, "--foo", "--bar"], { "stdio": "inherit" });
      expect(console.error).not.toHaveBeenCalled();
    });

    test(`should run script "${script}" with expected failure result`, () => {
      crossSpawn.sync = jest.fn(() => failureResult);
      console.error = jest.fn();

      const code = index.run(script);

      expect(code).toBe(failureResult.status);
      expect(crossSpawn.sync).toHaveBeenCalledTimes(1);
      expect(crossSpawn.sync).toHaveBeenCalledWith("node", [scriptPath], { "stdio": "inherit" });
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(`Script "${script}" failed (${failureResult.signal})`);
    });
  });

  test(`should not run unknown script`, () => {
    crossSpawn.sync = jest.fn();
    console.warn = jest.fn();

    const script = "foo";
    const code = index.run(script);

    expect(code).toBe(0);
    expect(crossSpawn.sync).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(`Unknown script "${script}"`);
  });
});
