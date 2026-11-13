import { describe, expect, it } from "vitest";
import { brakePointsOf, paSparetAnswering } from "./paSparetAnswering";

const trip = { type: "paSparet" as const, acceptedAnswers: ["Kiruna"], fuzzy: true, clues: ["a", "b", "c", "d", "e"] };
const guess = (text: string, brakeClueIndex: number | null) => ({ type: "paSparet" as const, guess: text, brakeClueIndex });
const team = (name: string) => ({ _id: name, name, colour: "red" as const });

describe("brakePointsOf", () => {
  it("gives the points of the clue braked at, and none without a brake", () => {
    expect(brakePointsOf(0)).toBe(10);
    expect(brakePointsOf(4)).toBe(2);
    expect(brakePointsOf(null)).toBeNull();
    expect(brakePointsOf(7)).toBeNull();
  });
});

describe("paSparetAnswering", () => {
  it("can be sent once a guess is written", () => {
    expect(paSparetAnswering.isComplete({ type: "paSparet" }, guess("Kiruna", null))).toBe(true);
    expect(paSparetAnswering.isComplete({ type: "paSparet" }, guess("  ", null))).toBe(false);
    expect(paSparetAnswering.show(trip)).toEqual({ type: "paSparet" });
    expect(paSparetAnswering.startingAnswer({ type: "paSparet" })).toBeNull();
  });

  it("scores a right guess the points it braked at, a wrong or unbraked one nothing", () => {
    const outcomes = paSparetAnswering.outcomes(trip, [guess(" kiruna ", 1), guess("Luleå", 0), guess("Kiruna", null)]);
    expect(outcomes.map((outcome) => outcome.points)).toEqual([8, 0, 0]);
    expect(outcomes[0].parts).toEqual([{ label: "", given: "kiruna", result: "right", correct: "", points: 8 }]);
    expect(outcomes[2].parts[0].result).toBe("wrong");
  });

  it("waits for a verdict on a braked guess that matched no spelling, and counts it once given", () => {
    expect(paSparetAnswering.outcomes(trip, [guess("Kirunaa", 2)])[0].parts[0].result).toBe("pending");
    expect(paSparetAnswering.outcomes(trip, [guess("Kirunaa", 2)], [{ slot: 0, text: "kirunaa", target: 0 }])[0].points).toBe(6);
  });

  it("sends only braked guesses to review", () => {
    expect(paSparetAnswering.review?.texts(guess("Kirunaa", 2))).toEqual([{ slot: 0, text: "Kirunaa" }]);
    expect(paSparetAnswering.review?.texts(guess("Kirunaa", null))).toEqual([]);
  });

  it("reveals the destination and every team's guess, most points first", () => {
    const graded = { answers: [guess("Luleå", 0), guess("Kiruna", 3), guess("Gällivare", null)], verdicts: [], teams: [team("Röda"), team("Blå"), team("Gröna")] };
    expect(paSparetAnswering.reveal(trip, graded)).toEqual({
      type: "paSparet",
      destination: "Kiruna",
      guesses: [
        { teamId: "Blå", name: "Blå", colour: "red", guess: "Kiruna", brakePoints: 4, points: 4, result: "right" },
        { teamId: "Röda", name: "Röda", colour: "red", guess: "Luleå", brakePoints: 10, points: 0, result: "pending" },
        { teamId: "Gröna", name: "Gröna", colour: "red", guess: "Gällivare", brakePoints: null, points: 0, result: "wrong" },
      ],
    });
    expect(paSparetAnswering.reveal(trip)).toEqual({ type: "paSparet", destination: "Kiruna", guesses: [] });
  });
});
