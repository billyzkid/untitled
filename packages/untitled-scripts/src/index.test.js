import { execute } from "./index"

describe("execute", () => {
  test("should be an exported function", () => {
    expect(execute).toBeInstanceOf(Function);
  });

  test("can run build script", () => {
    const code = execute("build");
    expect(code).toBe(0);
  });

  test("can run eject script", () => {
    const code = execute("eject");
    expect(code).toBe(0);
  });

  test("can run start script", () => {
    const code = execute("start");
    expect(code).toBe(0);
  });

  test("can run test script", () => {
    const code = execute("test");
    expect(code).toBe(0);
  });

  test("can run unknown script", () => {
    const code = execute("unknown");
    expect(code).toBe(0);
  });
});