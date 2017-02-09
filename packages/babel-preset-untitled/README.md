# babel-preset-untitled

> [Babel](http://babeljs.io/) preset for [untitled](https://billyzkid.github.io/untitled/) authors and developers

This preset includes the following plugins:

* [untitled](../eslint-plugin-untitled/README.md)

For more information, check out the [Babel Setup Page](http://babeljs.io/docs/setup/).

## Installation

Install the Babel CLI and preset dev dependencies.

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