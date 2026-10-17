import { describe, expect, it } from "vitest";
import { replaceAt } from "./replaceAt";

describe("replaceAt", () => {
  it("returns a copy with the item at the index replaced", () => {
    const items = ["a", "b"];
    expect(replaceAt(items, 1, "c")).toEqual(["a", "c"]);
    expect(items).toEqual(["a", "b"]);
  });
});
