import English from "./English";

describe("English", () => {
  test("instance can be constructed", () => {
    const instance = new English();
    expect(instance).toBeInstanceOf(English);
  });
});
