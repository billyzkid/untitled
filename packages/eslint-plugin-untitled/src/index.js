import noConsole from "./rules/no-console";

export const rules = {
  "no-console": noConsole
};

export const configs = {
  base: {
    rules: {}
  },
  extension: {
    rules: {}
  },
  story: {
    rules: {
      "untitled/no-console": "error"
    }
  }
};
