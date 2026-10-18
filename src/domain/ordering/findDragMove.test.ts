import { describe, expect, it } from "vitest";
import { findDragMove } from "./findDragMove";

const ids = ["a", "b", "c"];

describe("findDragMove", () => {
  it("gives the indices of the dragged item and the item it was dropped on", () => {
    expect(findDragMove(ids, "a", "c")).toEqual({ fromIndex: 0, toIndex: 2 });
    expect(findDragMove(ids, "c", "b")).toEqual({ fromIndex: 2, toIndex: 1 });
  });

  it("is null when dropped outside the list or on itself", () => {
    expect(findDragMove(ids, "a", null)).toBeNull();
    expect(findDragMove(ids, "b", "b")).toBeNull();
  });

  it("is null when an id is not in the list", () => {
    expect(findDragMove(ids, "x", "a")).toBeNull();
    expect(findDragMove(ids, "a", "x")).toBeNull();
  });
});
