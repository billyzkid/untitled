const method = ["log", "info", "warn", "error", "debug"];

export default context => ({
  MemberExpression: (node) => {
    if (node.object.name === "console" && method.indexOf(node.property.name) >= 0) {
      context.report(node, `Use story.${node.property.name} instead of console.${node.property.name}`);
    }
  }
});

export const schema = [];
