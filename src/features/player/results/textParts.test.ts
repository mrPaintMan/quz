import { describe, expect, it } from "vitest";
import type { OutcomePart } from "@/domain/answering/outcome";
import { partsOfTexts } from "./textParts";

const part = (at: number): OutcomePart => ({ label: "", given: "", result: "right", correct: "", points: 1, at });

describe("partsOfTexts", () => {
  it("gives each text the part recorded for its place, and none for blanks and repeats", () => {
    const parts = [part(0), part(3)];
    expect(partsOfTexts(4, parts)).toEqual([parts[0], undefined, undefined, parts[1]]);
  });
});
