# babel-preset-untitled

> Babel [preset](http://babeljs.io/docs/plugins/#presets) for [Untitled](https://billyzkid.github.io/untitled/) authors and developers

This preset includes the following plugins:

* [untitled](../eslint-plugin-untitled/README.md)

## Installation

Install the necessary dependencies.

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

Configure the `untitled` preset. Note that you may omit the `babel-preset-` prefix.

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