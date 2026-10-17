import { describe, expect, it } from "vitest";
import { removeAt } from "./removeAt";

describe("removeAt", () => {
  it("returns a copy without the item at the index", () => {
    const items = ["a", "b", "c"];
    expect(removeAt(items, 1)).toEqual(["a", "c"]);
    expect(items).toEqual(["a", "b", "c"]);
  });
});
