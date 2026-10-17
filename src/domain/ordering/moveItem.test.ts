import { describe, expect, it } from "vitest";
import { moveItem } from "./moveItem";

describe("moveItem", () => {
  it("moves an item later in the list", () => {
    expect(moveItem(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"]);
  });

  it("moves an item earlier in the list", () => {
    expect(moveItem(["a", "b", "c"], 2, 0)).toEqual(["c", "a", "b"]);
  });

  it("clamps a target outside the list to its ends", () => {
    expect(moveItem(["a", "b", "c"], 0, 10)).toEqual(["b", "c", "a"]);
    expect(moveItem(["a", "b", "c"], 2, -1)).toEqual(["c", "a", "b"]);
  });

  it("leaves the original array unchanged", () => {
    const items = ["a", "b"];
    moveItem(items, 0, 1);
    expect(items).toEqual(["a", "b"]);
  });
});
