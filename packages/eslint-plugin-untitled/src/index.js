import noConsole from "./rules/no-console";

export const rules = {
  "no-console": noConsole
};

export const configs = {
  recommended: {
    rules: {
      "untitled/no-console": 2
    }
  },
  guide: {
    rules: {}
  }
};
