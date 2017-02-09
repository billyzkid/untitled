# eslint-plugin-untitled

TODO

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
npm install eslint --save-dev
```

Next, install `eslint-plugin-untitled`:

```
npm install eslint-plugin-untitled --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-untitled` globally.

## Usage

Add `untitled` to the plugins section of your ESLint configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": [
    "untitled"
  ]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "untitled/rule-name": 2
  }
}
```

## Supported Rules

* no-console - Use story.* instead of console.* for logging