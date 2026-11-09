import { describe, expect, it } from "vitest";
import { shuffleUnsolved } from "./shuffleUnsolved";

describe("shuffleUnsolved", () => {
  it("keeps every text", () => {
    const texts = ["Titanic", "Avatar", "Oppenheimer", "Frost"];
    expect([...shuffleUnsolved(texts)].sort()).toEqual([...texts].sort());
  });

  it("shuffles the same whatever the right order, so the order shown gives nothing away", () => {
    expect(shuffleUnsolved(["Titanic", "Avatar", "Oppenheimer"])).toEqual(shuffleUnsolved(["Avatar", "Titanic", "Oppenheimer"]));
  });

  it("never gives the right order", () => {
    for (const texts of [["A", "B"], ["B", "A"], ["Titanic", "Avatar", "Oppenheimer", "Frost"]]) {
      expect(shuffleUnsolved(texts)).not.toEqual(texts);
    }
  });
});
