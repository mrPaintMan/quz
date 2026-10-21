import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { PaSparetQuestions } from "./PaSparetQuestions";

const calls: { name: string; args: unknown }[] = [];
vi.mock("@/features/host/shared/useHostMutation", async () => {
  const { getFunctionName } = await vi.importActual<typeof import("convex/server")>("convex/server");
  return {
    useHostMutation: (reference: Parameters<typeof getFunctionName>[0]) => async (args: unknown) => {
      const name = getFunctionName(reference);
      calls.push({ name, args });
      if (name.endsWith("addFilm")) return { filmId: "new-film", questionId: "new-question" };
      return "new-question";
    },
  };
});
vi.mock("@/features/host/shared/useHostQuery", () => ({ useHostQuery: () => undefined }));

const question = (id: string, prompt: string, filmId?: string): Doc<"questions"> => ({
  _id: id as Id<"questions">,
  _creationTime: 0,
  quizId: "quiz" as Id<"quizzes">,
  roundId: "r1" as Id<"rounds">,
  position: 0,
  prompt,
  timeLimitSeconds: null,
  media: null,
  hostNotes: "",
  content: filmId ? { type: "activity", maxPoints: 1 } : { type: "paSparet", acceptedAnswers: [], fuzzy: true, clues: ["", "", "", "", ""] },
  ...(filmId ? { filmId } : {}),
}) as Doc<"questions">;

const round = (questions: Doc<"questions">[], filmIds: string[]) => ({
  _id: "r1" as Id<"rounds">,
  _creationTime: 0,
  quizId: "quiz" as Id<"quizzes">,
  position: 0,
  title: "På spåret",
  kind: "paSparet" as const,
  films: filmIds.map((id) => ({ id, video: null })),
  questions,
});

describe("PaSparetQuestions", () => {
  beforeEach(() => {
    calls.length = 0;
  });

  it("shows the trip first, then each film with its numbered questions", () => {
    const questions = [question("t", "Resan"), question("q1", "Vilken bro?", "a"), question("q2", "Vilket år?", "b")];
    render(<PaSparetQuestions round={round(questions, ["a", "b"])} selectedQuestionId={null} onSelectQuestion={vi.fn()} />);
    expect(screen.getByText("Resan")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "Film 1" })).getByText("Vilken bro?")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "Film 2" })).getByText(/F3/)).toBeInTheDocument();
  });

  it("adds a film with its first question and selects that question", async () => {
    const onSelectQuestion = vi.fn();
    render(<PaSparetQuestions round={round([question("t", "Resan")], [])} selectedQuestionId={null} onSelectQuestion={onSelectQuestion} />);
    await userEvent.selectOptions(screen.getByLabelText("Ny film, med en första fråga av typen"), "Gissa siffran");
    await userEvent.click(screen.getByRole("button", { name: "Lägg till film" }));
    expect(calls).toContainEqual({ name: "rounds/filmMutations:addFilm", args: { roundId: "r1", type: "number" } });
    expect(onSelectQuestion).toHaveBeenCalledWith("new-question");
  });

  it("stops offering films and questions once three questions follow the films", () => {
    const questions = [question("t", "Resan"), question("q1", "A", "a"), question("q2", "B", "a"), question("q3", "C", "a")];
    render(<PaSparetQuestions round={round(questions, ["a"])} selectedQuestionId={null} onSelectQuestion={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "Lägg till film" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Lägg till fråga" })).not.toBeInTheDocument();
    expect(screen.getByText("Omgången har 3 frågor till sina filmer, det högsta antalet.")).toBeInTheDocument();
  });

  it("marks a film's question as not ready until the film is uploaded", () => {
    const questions = [question("t", "Resan"), question("q1", "Vilken bro?", "a")];
    render(<PaSparetQuestions round={round(questions, ["a"])} selectedQuestionId={null} onSelectQuestion={vi.fn()} />);
    expect(within(screen.getByRole("region", { name: "Film 1" })).getByText("Ej klar")).toBeInTheDocument();
  });
});
