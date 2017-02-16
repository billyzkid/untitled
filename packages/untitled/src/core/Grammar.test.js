import Grammar from "./Grammar";

describe("Grammar", () => {
  test("instance can be constructed", () => {
    const instance = new Grammar();
    expect(instance).toBeInstanceOf(Grammar);
  });
});