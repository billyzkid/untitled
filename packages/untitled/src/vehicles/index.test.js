import * as vehicles from "./index";
import { Automobile, Plane, Train } from "./index";

describe("vehicles", () => {
  test("should have expected exports", () => {
    expect(vehicles).toEqual({ Automobile, Plane, Train });
  });
});