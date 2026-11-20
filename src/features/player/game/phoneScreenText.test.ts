import { describe, expect, it } from "vitest";
import { phoneScreenText } from "./phoneScreenText";

describe("phoneScreenText", () => {
  it.each([
    [{ kind: "lobby" } as const, "Ni är med! Vi börjar snart."],
    [{ kind: "question", isTrip: false, roundNumber: 1, questionNumber: 1, prompt: "Vilken krydda?", description: "", answeredInApp: true, shown: null } as const, "Frågan visas på TV:n."],
    [{ kind: "question", isTrip: false, roundNumber: 1, questionNumber: 2, prompt: "Baka", description: "", answeredInApp: false, shown: null } as const, "Aktivitet pågår."],
    [{ kind: "film", roundNumber: 3 } as const, "Titta på filmen."],
    [{ kind: "rules", roundCount: 3, questionCount: 9, activityCount: 1 } as const, "Titta på TV:n."],
    [{ kind: "finalLeaderboard" } as const, "Titta på TV:n."],
  ])("tells the team what is going on", (view, text) => {
    expect(phoneScreenText(view)).toBe(text);
  });
});
