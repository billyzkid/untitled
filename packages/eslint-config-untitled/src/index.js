export default {
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