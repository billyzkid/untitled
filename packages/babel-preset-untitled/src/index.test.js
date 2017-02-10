import preset from "./index";

describe("preset", () => {
  test("should have an array of presets", () => {
    expect(Array.isArray(preset.presets)).toBe(true);
  });

  test("should have an array of plugins", () => {
    expect(Array.isArray(preset.plugins)).toBe(true);
  });
});
