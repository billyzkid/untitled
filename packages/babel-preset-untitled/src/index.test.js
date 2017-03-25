import index from "./index";

describe("index", () => {
  test("should have an array of presets", () => {
    expect(Array.isArray(index.presets)).toBe(true);
  });

  test("should have an array of plugins", () => {
    expect(Array.isArray(index.plugins)).toBe(true);
  });
});
