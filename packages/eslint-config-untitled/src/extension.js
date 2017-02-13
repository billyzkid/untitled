// NOTE: Due to a change in Babel 6, "export default" will not work here:
// https://babeljs.io/docs/plugins/transform-es2015-modules-commonjs/

module.exports = {
  extends: [
    "./base.js",
    "plugin:untitled/extension"
  ],
  rules: {
    "no-console": "off"
  }
};