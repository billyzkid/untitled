"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (context) {
  return {
    MemberExpression: function MemberExpression(node) {
      if (node.object.name === "console" && method.indexOf(node.property.name) >= 0) {
        context.report(node, "Use story." + node.property.name + " instead of console." + node.property.name);
      }
    }
  };
};

var schema = exports.schema = [];