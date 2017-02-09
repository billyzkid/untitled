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

For more information, check out the [Setup Page](http://babeljs.io/docs/setup/).

## Installation

Install the Babel CLI and this preset.

```sh
npm install --save-dev babel-cli babel-preset-untitled
```

Make a .babelrc configuration file with the preset.

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

Configure this preset. Note you can omit the `babel-preset-` prefix from the `untitled` preset.

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