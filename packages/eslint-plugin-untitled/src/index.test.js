import fs from "fs";
import path from "path";
import { rules } from "./index";

const rulesPath = path.resolve(__dirname, "./rules");
const ruleNames = fs.readdirSync(rulesPath).filter(f => path.extname(f) === ".js").map(f => path.basename(f, ".js")).filter(name => !name.endsWith(".test"));

describe("rules", () => {
  ruleNames.forEach((ruleName) => {
    test(`should include ${ruleName}`, () => {
      expect(rules[ruleName]).toBeDefined();
    });
  });
});
