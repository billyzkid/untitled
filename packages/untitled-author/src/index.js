import packageJson from "../package.json";


console.warn(`${packageJson.name} is not implemented!`);

class Zork {
  instanceProperty = "xyzzy";
  boundFunction = () => {
    return this.instanceProperty;
  }

  static staticProperty = "plugh";
  static staticFunction = function () {
    return Zork.staticProperty;
  }
}

const { x, y, ...z } = { x: 1, y: 2, a: 3, b: 4 };

export { Zork, x, y, z };