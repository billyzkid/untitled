import { RuleTester } from "eslint";
import rule from "./no-console";

const ruleTester = new RuleTester();

ruleTester.run("no-console", rule, {
  valid: [
    "story.log(\"message\")",
    "story.info(\"message\")",
    "story.warn(\"message\")",
    "story.error(\"message\")",
    "story.debug(\"message\")"
  ],
  invalid: [
    { code: "console.log(\"message\")", errors: [{ message: "Use story.log instead of console.log" }] },
    { code: "console.info(\"message\")", errors: [{ message: "Use story.info instead of console.info" }] },
    { code: "console.warn(\"message\")", errors: [{ message: "Use story.warn instead of console.warn" }] },
    { code: "console.error(\"message\")", errors: [{ message: "Use story.error instead of console.error" }] },
    { code: "console.debug(\"message\")", errors: [{ message: "Use story.debug instead of console.debug" }] }
  ]
});