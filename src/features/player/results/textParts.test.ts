import { describe, expect, it } from "vitest";
import type { OutcomePart } from "@/domain/answering/outcome";
import { partsOfTexts } from "./textParts";

const part = (given: string): OutcomePart => ({ label: "", given, result: "right", correct: "", points: 1 });

describe("partsOfTexts", () => {
  it("pairs each written text with its part in order, skipping blanks and exact repeats", () => {
    const parts = [part("Glögg"), part("Kanel")];
    expect(partsOfTexts(["Glögg", "", "glögg.", "Kanel"], parts)).toEqual([parts[0], undefined, undefined, parts[1]]);
  });
});
