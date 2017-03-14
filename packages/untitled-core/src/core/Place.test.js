import Place from "./Place";

describe("Place", () => {
  test("instance can be constructed", () => {
    const instance = new Place();
    expect(instance).toBeInstanceOf(Place);
  });
});
