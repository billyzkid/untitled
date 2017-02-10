# eslint-config-untitled

> ESLint [shareable configs](http://eslint.org/docs/developer-guide/shareable-configs) for [Untitled](https://billyzkid.github.io/untitled/) authors and developers

## Installation

Install the necessary dependencies.

```sh
npm install --save-dev eslint eslint-config-untitled eslint-plugin-untitled babel-eslint
```

## Usage

Configure the `untitled` config. Note that you may omit the `eslint-config-` prefix.

### Via CLI

```sh
eslint --config untitled
```

### Via `.eslintrc`

```json
{
  "extends": [
    "untitled"
  ]
}
```

### Via `package.json`

```json
{
  "eslintConfig": {
    "extends": [
      "untitled"
    ]
  }
}
```