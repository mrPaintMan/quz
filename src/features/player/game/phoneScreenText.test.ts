import { describe, expect, it } from "vitest";
import { phoneScreenText } from "./phoneScreenText";

describe("phoneScreenText", () => {
  it.each([
    [{ kind: "lobby" } as const, "Ni är med! Vi börjar snart."],
    [{ kind: "question", roundNumber: 1, questionNumber: 1, prompt: "Vilken krydda?", answeredInApp: true } as const, "Frågan visas på TV:n."],
    [{ kind: "question", roundNumber: 1, questionNumber: 2, prompt: "Baka", answeredInApp: false } as const, "Aktivitet pågår."],
    [{ kind: "film", roundNumber: 3 } as const, "Titta på filmen."],
    [{ kind: "rules", roundCount: 3, questionCount: 9, activityCount: 1 } as const, "Titta på TV:n."],
    [{ kind: "finalLeaderboard" } as const, "Titta på TV:n."],
  ])("tells the team what is going on", (view, text) => {
    expect(phoneScreenText(view)).toBe(text);
  });
});
