import { Zork, x, y, z } from "./index";

describe("babel-preset-untitled", () => {
  test("should transform class properties", () => {
    const zork = new Zork();
    expect(zork.boundFunction.call(undefined)).toBe("xyzzy");
    expect(Zork.staticFunction()).toBe("plugh");
  });

  test("should transform object rest spread", () => {
    expect({ x, y, ...z }).toEqual({ x: 1, y: 2, a: 3, b: 4 });
  });
});
