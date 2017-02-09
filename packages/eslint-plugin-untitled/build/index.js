"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.configs = exports.rules = undefined;

var _noConsole = require("./rules/no-console");

var _noConsole2 = _interopRequireDefault(_noConsole);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var rules = exports.rules = {
  "no-console": _noConsole2.default
};

var configs = exports.configs = {
  recommended: {
    rules: {
      "untitled/no-console": 2
    }
  },
  guide: {
    rules: {}
  }
};