# babel-preset-untitled

> [Babel](http://babeljs.io/) preset for untitled authors and developers

This preset includes the following plugins:

- TODO

<!--
- [syntax-flow](https://babeljs.io/docs/plugins/syntax-flow/)
- [syntax-jsx](https://babeljs.io/docs/plugins/syntax-jsx/)
- [transform-flow-strip-types](https://babeljs.io/docs/plugins/transform-flow-strip-types/)
- [transform-react-jsx](https://babeljs.io/docs/plugins/transform-react-jsx/)
- [transform-react-display-name](https://babeljs.io/docs/plugins/transform-react-display-name/)
-->

For more information, check out the [Babel Setup Page](http://babeljs.io/docs/setup/).

## Installation

Install the Babel CLI and preset as dev dependencies.

```sh
npm install --save-dev babel-cli babel-preset-untitled
```

Create a .babelrc file with the `untitled` preset configuration.

```sh
echo '{ "presets": ["untitled"] }' > .babelrc
```

Create a test script.

```sh
echo '[1,2,3].map(n => n + 1);' > script.js
```

View the tranformed output.

```sh
babel script.js
```

## Usage

Configure the `untitled` preset. Note you can omit the `babel-preset-` prefix.

### Via CLI

```sh
babel script.js --presets untitled
```

### Via API

```javascript
babel.transform("code", {
  presets: ["untitled"]
});
```

### Via `.babelrc`

```json
{
  "presets": ["untitled"]
}
```

### Via `package.json`

```json
"babel": {
  "presets": ["untitled"]
}
```