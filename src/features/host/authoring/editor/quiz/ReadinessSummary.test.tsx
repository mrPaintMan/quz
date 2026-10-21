import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Doc } from "@convex/_generated/dataModel";
import { ReadinessSummary } from "./ReadinessSummary";

const question = (prompt: string) =>
  ({ prompt, timeLimitSeconds: null, content: { type: "activity", maxPoints: 1 } }) as Doc<"questions">;
const rounds = (...prompts: string[]) =>
  [{ questions: prompts.map(question) }] as (Doc<"rounds"> & { questions: Doc<"questions">[] })[];

describe("ReadinessSummary", () => {
  it.each([
    [rounds(), "Inga frågor ännu"],
    [rounds("A", "B"), "Alla 2 frågor är klara"],
    [rounds("A", ""), "1 fråga behöver fyllas i"],
    [rounds("", ""), "2 frågor behöver fyllas i"],
  ])("summarizes readiness", (input, text) => {
    render(<ReadinessSummary rounds={input} />);
    expect(screen.getByRole("status")).toHaveTextContent(text);
    expect(screen.getByRole("button", { name: "Starta quiz" })).toBeDisabled();
  });

  it("counts a question after a film as unfinished until the film is uploaded", () => {
    const afterFilm = { ...question("Vilken bro?"), media: null, filmId: "f1" } as Doc<"questions">;
    const paSparet = [{ films: [{ id: "f1", video: null }], questions: [afterFilm] }] as (Doc<"rounds"> & { questions: Doc<"questions">[] })[];
    render(<ReadinessSummary rounds={paSparet} />);
    expect(screen.getByRole("status")).toHaveTextContent("1 fråga behöver fyllas i");
  });
});
