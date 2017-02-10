import * as grammars from "./index";
import { English } from "./index";

describe("grammars", () => {
  test("should have expected exports", () => {
    expect(grammars).toEqual({ English });
  });
});
