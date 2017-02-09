# eslint-plugin-untitled

> [ESLint](http://eslint.org/) plugin for untitled authors and developers

This plugin includes the following rules:

- TODO

<!--
* [react/display-name](docs/rules/display-name.md): Prevent missing `displayName` in a React component definition
* [react/forbid-component-props](docs/rules/forbid-component-props.md): Forbid certain props on Components
* [react/forbid-prop-types](docs/rules/forbid-prop-types.md): Forbid certain propTypes
-->

For more information, check out the [Developer Guide](http://eslint.org/docs/developer-guide/working-with-plugins).

## Installation

Install ESLint and this plugin.

```sh
npm install --save-dev eslint eslint-plugin-untitled
```

## Usage

Configure this plugin and its rules. Note you can omit the `eslint-plugin-` prefix from the `untitled` plugin.

### Via `.eslintrc`

```json
{
  "plugins": ["untitled"],
  "rules": {
    "untitled/rule-name": 2
  }
}
```

### Via `package.json`

```json
"eslintConfig": {
  "plugins": ["untitled"],
  "rules": {
    "untitled/rule-name": 2
  }
}
```