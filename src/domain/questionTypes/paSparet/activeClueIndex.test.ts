import { describe, expect, it } from "vitest";
import { activeClueIndex } from "./activeClueIndex";

describe("activeClueIndex", () => {
  it.each([
    [0, 0],
    [23.9, 0],
    [24, 1],
    [60, 2],
    [96, 4],
    [119.9, 4],
  ])("at %s s into a 2-minute film shows clue index %s", (position, index) => {
    expect(activeClueIndex(position, 120)).toBe(index);
  });

  it("stays on the last clue after the film has ended", () => {
    expect(activeClueIndex(130, 120)).toBe(4);
  });

  it("stays on the first clue while the film's length is unknown", () => {
    expect(activeClueIndex(0, 0)).toBe(0);
  });

  it("stays on the first clue before the film has started", () => {
    expect(activeClueIndex(-1, 120)).toBe(0);
  });
});
