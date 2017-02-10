// NOTE: Due to a change in Babel 6, "export default" will not work here
// See https://babeljs.io/docs/plugins/transform-es2015-modules-commonjs/

module.exports = {
  root: "true",
  parser: "babel-eslint",
  plugins: [
    "untitled"
  ],
  extends: [
    "eslint:recommended",
    "plugin:untitled/recommended"
  ],
  env: {
    es6: true,
    node: true,
    jest: true
  }
};
