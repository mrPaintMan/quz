import { describe, expect, it } from "vitest";
import type { ScreenView } from "@/domain/screenSequence/describeScreen";
import { screenLabel } from "./screenLabel";

describe("screenLabel", () => {
  it.each<[ScreenView, string]>([
    [{ kind: "lobby" }, "Lobby"],
    [{ kind: "rules", roundCount: 1, questionCount: 1, activityCount: 0 }, "Regler"],
    [{ kind: "roundIntro", roundNumber: 1, title: "Julmat" }, "Omgång 1: Julmat"],
    [{ kind: "question", roundNumber: 1, questionNumber: 2, prompt: "?", answeredInApp: true }, "Omgång 1 · Fråga 2"],
    [{ kind: "answer", roundNumber: 1, questionNumber: 2, prompt: "?" }, "Omgång 1 · Svar på fråga 2"],
    [{ kind: "film", roundNumber: 3 }, "Omgång 3 · Film"],
    [{ kind: "leaderboard", roundNumber: 1 }, "Topplista efter omgång 1"],
    [{ kind: "finalLeaderboard" }, "Slutresultat"],
  ])("names the screen", (view, label) => {
    expect(screenLabel(view)).toBe(label);
  });
});
