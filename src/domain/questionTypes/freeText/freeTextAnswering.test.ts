import { describe, expect, it } from "vitest";
import { pointsOf } from "@/domain/answering/outcome";
import type { ContentOf } from "@convex/questions/questionContent";
import { freeTextAnswering } from "./freeTextAnswering";

const single: ContentOf<"freeText"> = {
  type: "freeText",
  fields: [{ label: "gammal etikett", acceptedAnswers: ["Kanel", "kanelstång"] }],
  pointsPerField: 1,
  fuzzy: true,
};
const twoFields: ContentOf<"freeText"> = {
  type: "freeText",
  fields: [
    { label: "Artist", acceptedAnswers: ["ABBA"] },
    { label: "Låt", acceptedAnswers: ["Happy New Year"] },
  ],
  pointsPerField: 2,
  fuzzy: true,
};
const texts = (...fields: string[]) => ({ type: "freeText" as const, fields });

describe("freeTextAnswering", () => {
  it("shows each field's label, but none for a single field", () => {
    expect(freeTextAnswering.show(twoFields)).toEqual({ type: "freeText", labels: ["Artist", "Låt"] });
    expect(freeTextAnswering.show(single)).toEqual({ type: "freeText", labels: [""] });
  });

  it("reveals each field's first filled-in accepted answer", () => {
    expect(freeTextAnswering.reveal(twoFields)).toEqual({
      type: "freeText",
      fields: [
        { label: "Artist", answer: "ABBA" },
        { label: "Låt", answer: "Happy New Year" },
      ],
    });
    expect(freeTextAnswering.reveal({ ...single, fields: [{ label: "", acceptedAnswers: [" ", " Saffran "] }] })).toEqual({
      type: "freeText",
      fields: [{ label: "", answer: "Saffran" }],
    });
  });

  it("starts with nothing written", () => {
    expect(freeTextAnswering.startingAnswer({ type: "freeText", labels: [""] })).toBeNull();
  });

  it("can be sent with a field blank, as long as one is filled in", () => {
    const shown = freeTextAnswering.show(twoFields);
    expect(freeTextAnswering.isComplete(shown, texts("ABBA", ""))).toBe(true);
    expect(freeTextAnswering.isComplete(shown, texts(" ", ""))).toBe(false);
    expect(freeTextAnswering.isComplete(shown, texts("ABBA"))).toBe(false);
  });

  it("scores each field that matches one of its own accepted answers", () => {
    expect(pointsOf(freeTextAnswering.outcomes(twoFields, [texts("abba", "happy new year."), texts("Abba ", "Mamma mia"), texts("Happy New Year", "ABBA")]))).toEqual([4, 2, 0]);
    expect(pointsOf(freeTextAnswering.outcomes(single, [texts("KANELSTÅNG"), texts("kardemumma")]))).toEqual([1, 0]);
  });

  it("never counts an empty or missing field, even against an answer of only a full stop", () => {
    const odd = { ...single, fields: [{ label: "", acceptedAnswers: ["."] }] };
    expect(pointsOf(freeTextAnswering.outcomes(odd, [texts(""), texts()]))).toEqual([0, 0]);
  });

  it("doesn't count a misspelling", () => {
    expect(pointsOf(freeTextAnswering.outcomes(single, [texts("kanell")]))).toEqual([0]);
  });

  it("gives the hosts' box each sub-question's correct answer, when it has one", () => {
    const withBlank = { ...twoFields, fields: [...twoFields.fields, { label: "År", acceptedAnswers: [" "] }] };
    expect(freeTextAnswering.review?.slots(withBlank).map((slot) => slot.answer)).toEqual(["ABBA", "Happy New Year", undefined]);
    expect(freeTextAnswering.review?.slots(single)[0].answer).toBeUndefined();
  });

  it("says for each sub-question what the team wrote, a blank one wrong, beside its answer", () => {
    const verdicts = [{ slot: 0, text: "abbba", target: 0 }];
    expect(freeTextAnswering.outcomes(twoFields, [texts("Abbba", "")], verdicts)[0]).toEqual({
      points: 2,
      parts: [
        { label: "a) Artist", given: "Abbba", result: "right", correct: "ABBA" },
        { label: "b) Låt", given: "", result: "wrong", correct: "Happy New Year" },
      ],
    });
    expect(freeTextAnswering.outcomes(single, [texts("Kanelen")])[0].parts).toEqual([{ label: "", given: "Kanelen", result: "pending", correct: "Kanel" }]);
  });
});
