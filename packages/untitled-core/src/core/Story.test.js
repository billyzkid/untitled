import Story from "./Story";

describe("Story", () => {
  test("instance can be constructed", () => {
    const instance = new Story();
    expect(instance).toBeInstanceOf(Story);
  });

  test("handles input/output", () => {
    const story = new Story();
    const output = story.input("go north");
    expect(output).toBe("go north ==> {\"title\":\"\",\"children\":[]}");
  });
});
