import Thing from "./Thing";

describe("Thing", () => {
  test("instance can be constructed", () => {
    const instance = new Thing();
    expect(instance).toBeInstanceOf(Thing);
  });
});