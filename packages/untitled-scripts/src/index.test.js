import { execute } from "./index"

describe("execute", () => {
  test("should be an exported function", () => {
    expect(execute).toBeInstanceOf(Function);
  });

  test("should succeed", () => {
    const code = execute("blah", ["blech"]);
    expect(code).toBe(0);
  });
});