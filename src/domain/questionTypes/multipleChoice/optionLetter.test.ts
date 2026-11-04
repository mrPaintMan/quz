import { describe, expect, it } from "vitest";
import { optionLetter } from "./optionLetter";

describe("optionLetter", () => {
  it.each([
    [0, "A"],
    [3, "D"],
  ])("names option %s %s", (index, letter) => {
    expect(optionLetter(index)).toBe(letter);
  });
});
