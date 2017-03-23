const space = " ";
const newlineRegExp = /\n/g;

function indent(str, size) {
  const spaces = space.repeat(size);

  return str.replace(newlineRegExp, `\n${spaces}`);
}

function getUniqueValues(values) {
  return [...new Set(values)];
}

function getPrettyJsonString(value, replacer) {
  return JSON.stringify(value, replacer, 2);
}

export {
  indent,
  getUniqueValues,
  getPrettyJsonString
};
