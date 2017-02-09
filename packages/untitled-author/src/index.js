import packageJson from "../package.json";

console.warn(`${packageJson.name} is not implemented!`);

// Tests for babel-preset-untitled package
// Test 1: babel-plugin-transform-class-properties
class Zork {
  instanceProperty = "foo";
  boundFunction = () => {
    return this.instanceProperty;
  }

  static staticProperty = "bar";
  static staticFunction = function () {
    return Bork.staticProperty;
  }
}

const zork = new Zork();
console.log(zork.boundFunction.call(undefined)); // "foo"
console.log(Zork.staticFunction()); // "bar"

// Test 2: babel-plugin-transform-object-rest-spread
const { x, y, ...z } = { x: 1, y: 2, a: 3, b: 4 };
console.log({ x, y, ...z }); // { x: 1, y: 2, a: 3, b: 4 }