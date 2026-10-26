import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { ReadinessSummary } from "./ReadinessSummary";

vi.mock("./StartGameButton", () => ({
  StartGameButton: ({ disabled }: { disabled: boolean }) => <button disabled={disabled}>Starta quiz</button>,
}));

const quizId = "quiz1" as Id<"quizzes">;
const question = (prompt: string) =>
  ({ prompt, timeLimitSeconds: null, content: { type: "activity", maxPoints: 1 } }) as Doc<"questions">;
const rounds = (...prompts: string[]) =>
  [{ questions: prompts.map(question) }] as (Doc<"rounds"> & { questions: Doc<"questions">[] })[];

describe("ReadinessSummary", () => {
  it.each([
    [rounds(), "Inga frågor ännu", false],
    [rounds("A", "B"), "Alla 2 frågor är klara", true],
    [rounds("A", ""), "1 fråga behöver fyllas i", false],
    [rounds("", ""), "2 frågor behöver fyllas i", false],
  ])("summarizes readiness and lets a ready quiz start", (input, text, canStart) => {
    render(<ReadinessSummary quizId={quizId} rounds={input} />);
    expect(screen.getByRole("status")).toHaveTextContent(text);
    expect(screen.getByRole("button", { name: "Starta quiz" })).toHaveProperty("disabled", !canStart);
  });

  it("counts a question after a film as unfinished until the film is uploaded", () => {
    const afterFilm = { ...question("Vilken bro?"), media: null, filmId: "f1" } as Doc<"questions">;
    const paSparet = [{ films: [{ id: "f1", video: null }], questions: [afterFilm] }] as (Doc<"rounds"> & { questions: Doc<"questions">[] })[];
    render(<ReadinessSummary quizId={quizId} rounds={paSparet} />);
    expect(screen.getByRole("status")).toHaveTextContent("1 fråga behöver fyllas i");
  });
});
