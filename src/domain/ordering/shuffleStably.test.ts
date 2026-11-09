import { describe, expect, it } from "vitest";
import { shuffleStably } from "./shuffleStably";

const items = ["Ett", "Två", "Tre", "Fyra", "Fem"];

describe("shuffleStably", () => {
  it("keeps every item", () => {
    expect(shuffleStably(items, "a").sort()).toEqual([...items].sort());
  });

  it("shuffles the same way for the same items and seed", () => {
    expect(shuffleStably(items, "julquiz")).toEqual(shuffleStably(items, "julquiz"));
  });

  it("shuffles differently for another seed", () => {
    expect(shuffleStably(items, "julquiz")).not.toEqual(shuffleStably(items, "påskquiz"));
  });
});
