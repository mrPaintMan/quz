import type { ContentOf } from "@convex/questions/questionContent";
import { describe, expect, it } from "vitest";
import { freeTextRules } from "./freeTextRules";

const field = (acceptedAnswers: string[]) => ({ label: "", acceptedAnswers });

const validContent: ContentOf<"freeText"> = {
  type: "freeText",
  fields: [field(["kanel", "kanelstång"])],
  pointsPerField: 1,
  fuzzy: true,
};

const messagesFor = (content: ContentOf<"freeText">) =>
  freeTextRules.findProblems(content).map((problem) => problem.message);

describe("freeTextRules", () => {
  it("gives points per field times the number of fields as max points", () => {
    expect(freeTextRules.maxPoints({ ...validContent, fields: [field(["a"]), field(["b"])] })).toBe(2);
  });

  it("finds no problems in a complete question", () => {
    expect(messagesFor(validContent)).toEqual([]);
  });

  it("asks for an accepted answer on a single-field question", () => {
    expect(messagesFor({ ...validContent, fields: [field([" "])] })).toEqual(["Lägg till minst ett godkänt svar."]);
  });

  it("names the sub-question that lacks an accepted answer", () => {
    expect(messagesFor({ ...validContent, fields: [field(["a"]), field([])] })).toEqual([
      "Delfråga 2 saknar godkänt svar.",
    ]);
  });

  it.each([0, 4])("flags %s fields as outside 1–3", (count) => {
    const fields = Array.from({ length: count }, () => field(["a"]));
    expect(messagesFor({ ...validContent, fields })).toContain("Frågan ska ha 1–3 svarsfält.");
  });

  it("flags zero points per field", () => {
    expect(messagesFor({ ...validContent, pointsPerField: 0 })).toEqual(["Poängen måste vara större än 0."]);
  });
});
