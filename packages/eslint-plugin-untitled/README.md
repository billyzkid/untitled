# eslint-plugin-untitled

> ESLint [plugin](http://eslint.org/docs/developer-guide/working-with-plugins) for [Untitled](https://billyzkid.github.io/untitled/) authors and developers

This plugin includes the following rules:

* [untitled/no-console](docs/rules/no-console.md) - Use story in place of console object for logging (TODO: docs)

## Installation

Install the necessary dependencies.

```sh
npm install --save-dev eslint eslint-plugin-untitled
```

## Usage

Configure the `untitled` plugin and rules. Note that you may omit the `eslint-plugin-` prefix.

### Via CLI

```sh
eslint --plugin untitled --rule 'untitled/rule-1: 0' --rule 'untitled/rule-2: 2'
```

### Via `.eslintrc`

```json
{
  "plugins": [
    "untitled"
  ],
  "rules": {
    "untitled/rule-1": 0,
    "untitled/rule-2": 2
  }
}
```

### Via `package.json`

```json
{
  "eslintConfig": {
    "plugins": [
      "untitled"
    ],
    "rules": {
      "untitled/rule-1": 0,
      "untitled/rule-2": 2
    }
  }
}
```