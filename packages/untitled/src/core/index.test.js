import * as core from "./index";
import { Grammar, Person, Place, Story, Thing, Vehicle } from "./index";

describe("core", () => {
  test("should have expected exports", () => {
    expect(core).toEqual({ Grammar, Person, Place, Story, Thing, Vehicle });
  });
});
