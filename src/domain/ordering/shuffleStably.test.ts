import { describe, expect, it } from "vitest";
import { shuffleStably } from "./shuffleStably";

const items = ["Ett", "Två", "Tre", "Fyra", "Fem"];

describe("shuffleStably", () => {
  it("keeps every item", () => {
    expect(shuffleStably(items, "a").sort()).toEqual([...items].sort());
  });

  it("shuffles the same way for the same seed", () => {
    expect(shuffleStably(items, "julquiz")).toEqual(shuffleStably(items, "julquiz"));
  });

  it("never gives the order it was given", () => {
    for (let seed = 0; seed < 200; seed++) {
      expect(shuffleStably(["A", "B"], String(seed))).toEqual(["B", "A"]);
      expect(shuffleStably(items, String(seed))).not.toEqual(items);
    }
  });

  it("leaves a single item as it is", () => {
    expect(shuffleStably(["Ensam"], "x")).toEqual(["Ensam"]);
  });
});
