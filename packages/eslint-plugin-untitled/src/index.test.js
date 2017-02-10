import fs from "fs";
import path from "path";
import { rules, configs } from "./index";

const rulesPath = path.resolve(__dirname, "../src/rules");
const ruleNames = fs.readdirSync(rulesPath).filter(f => path.extname(f) === ".js").map(f => path.basename(f, ".js")).filter(name => !name.endsWith(".test"));

describe("rules", () => {
  ruleNames.forEach((ruleName) => {
    test(`should include ${ruleName}`, () => {
      expect(rules[ruleName]).toBeDefined();
    });
  });
});

describe("configs", () => {
  ruleNames.forEach((ruleName) => {
    test(`should include recommended config for ${ruleName}`, () => {
      expect(configs.recommended.rules[`untitled/${ruleName}`]).toBeDefined();
    });
  });
});
