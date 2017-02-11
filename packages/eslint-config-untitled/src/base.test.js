import path from "path";
import { CLIEngine } from "eslint";

describe("config", () => {
  test("should be defined", () => {
    const engine = new CLIEngine({
      useEslintrc: false,
      configFile: path.resolve(__dirname, "base.js")
    });

    const report = engine.executeOnText("console.log();");

    expect(report.results.length).toBe(1);
    expect(report.results[0].messages.length).toBe(1);
  });
});
