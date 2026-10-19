import { describe, expect, it } from "vitest";
import { toFiveClueTexts } from "./toFiveClueTexts";

describe("toFiveClueTexts", () => {
  it("keeps the text and drops the points of clues saved before D30", () => {
    const clues = [10, 8, 6, 4, 2].map((points) => ({ text: `Värd ${points}`, points }));
    expect(toFiveClueTexts(clues)).toEqual(["Värd 10", "Värd 8", "Värd 6", "Värd 4", "Värd 2"]);
  });

  it("fills a short trip up with empty clues", () => {
    expect(toFiveClueTexts([{ text: "Gruva", points: 10 }])).toEqual(["Gruva", "", "", "", ""]);
  });

  it("cuts a long trip off after the fifth clue", () => {
    expect(toFiveClueTexts(["1", "2", "3", "4", "5", "6"])).toEqual(["1", "2", "3", "4", "5"]);
  });
});
