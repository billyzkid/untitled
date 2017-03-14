import Person from "./Person";

describe("Person", () => {
  test("instance can be constructed", () => {
    const instance = new Person();
    expect(instance).toBeInstanceOf(Person);
  });
});