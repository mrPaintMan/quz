import type { ContentOf } from "@convex/questions/questionContent";
import { describe, expect, it } from "vitest";
import { numberRules } from "./numberRules";

const tiersContent: ContentOf<"number"> = {
  type: "number",
  answer: 66,
  scoring: {
    mode: "tiers",
    tiers: [
      { within: 1, points: 3 },
      { within: 6, points: 1 },
    ],
  },
};

const closestContent: ContentOf<"number"> = {
  type: "number",
  answer: 600000,
  scoring: { mode: "closest", pointsByRank: [3, 2, 1] },
};

const messagesFor = (content: ContentOf<"number">) =>
  numberRules.findProblems(content).map((problem) => problem.message);

describe("numberRules", () => {
  it("gives the best tier's points as max points", () => {
    expect(numberRules.maxPoints(tiersContent)).toBe(3);
  });

  it("gives the first place's points as max points for closest wins", () => {
    expect(numberRules.maxPoints(closestContent)).toBe(3);
  });

  it("gives 0 max points when no scoring is set up yet", () => {
    expect(numberRules.maxPoints({ ...closestContent, scoring: { mode: "closest", pointsByRank: [] } })).toBe(0);
  });

  it("finds no problems in complete questions of both modes", () => {
    expect(messagesFor(tiersContent)).toEqual([]);
    expect(messagesFor(closestContent)).toEqual([]);
  });

  it("asks for the correct answer when it is not a finite number", () => {
    expect(messagesFor({ ...tiersContent, answer: Number.NaN })).toEqual(["Ange det rätta svaret."]);
  });

  it("asks for at least one tier", () => {
    expect(messagesFor({ ...tiersContent, scoring: { mode: "tiers", tiers: [] } })).toEqual([
      "Lägg till minst en poängnivå.",
    ]);
  });

  it("flags a negative margin and zero points per tier", () => {
    const scoring = { mode: "tiers" as const, tiers: [{ within: -1, points: 0 }] };
    expect(messagesFor({ ...tiersContent, scoring })).toEqual([
      "Poängnivå 1: marginalen kan inte vara negativ.",
      "Poängnivå 1: poängen måste vara större än 0.",
    ]);
  });

  it("asks for at least one placing in closest wins", () => {
    expect(messagesFor({ ...closestContent, scoring: { mode: "closest", pointsByRank: [] } })).toEqual([
      "Ange poäng för minst en placering.",
    ]);
  });

  it("flags a placing worth zero points", () => {
    expect(messagesFor({ ...closestContent, scoring: { mode: "closest", pointsByRank: [3, 0] } })).toEqual([
      "Poängen för varje placering måste vara större än 0.",
    ]);
  });

  it("accepts tiers written in any order as long as they are consistent", () => {
    const scoring = { mode: "tiers" as const, tiers: [{ within: 6, points: 1 }, { within: 1, points: 3 }] };
    expect(messagesFor({ ...tiersContent, scoring })).toEqual([]);
  });

  it("flags a wider margin that gives more points", () => {
    const scoring = { mode: "tiers" as const, tiers: [{ within: 1, points: 1 }, { within: 6, points: 3 }] };
    expect(messagesFor({ ...tiersContent, scoring })).toEqual([
      "Poängnivåerna krockar: en större marginal ska ge färre poäng, och två nivåer kan inte ha samma marginal.",
    ]);
  });

  it("flags two tiers with the same margin", () => {
    const scoring = { mode: "tiers" as const, tiers: [{ within: 1, points: 3 }, { within: 1, points: 1 }] };
    expect(messagesFor({ ...tiersContent, scoring })).toEqual([
      "Poängnivåerna krockar: en större marginal ska ge färre poäng, och två nivåer kan inte ha samma marginal.",
    ]);
  });

  it("asks for a missing margin and points without reporting a collision", () => {
    const scoring = {
      mode: "tiers" as const,
      tiers: [{ within: 1, points: 3 }, { within: Number.NaN, points: Number.NaN }],
    };
    expect(messagesFor({ ...tiersContent, scoring })).toEqual([
      "Poängnivå 2: ange en marginal.",
      "Poängnivå 2: poängen måste vara större än 0.",
    ]);
  });

  it("flags a lower placing that gives more points than the one above", () => {
    expect(messagesFor({ ...closestContent, scoring: { mode: "closest", pointsByRank: [1, 3, 2] } })).toEqual([
      "En lägre placering kan inte ge fler poäng än den före.",
    ]);
  });

  it("allows placings that share points", () => {
    expect(messagesFor({ ...closestContent, scoring: { mode: "closest", pointsByRank: [3, 3, 1] } })).toEqual([]);
  });

  it("asks for the correct answer until it is entered", () => {
    expect(messagesFor({ ...tiersContent, answer: null })).toEqual(["Ange det rätta svaret."]);
  });
});
