import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { FilmCard } from "./FilmCard";

const calls: { name: string; args: unknown }[] = [];
vi.mock("@/features/host/shared/useHostMutation", async () => {
  const { getFunctionName } = await vi.importActual<typeof import("convex/server")>("convex/server");
  return {
    useHostMutation: (reference: Parameters<typeof getFunctionName>[0]) => async (args: unknown) => {
      calls.push({ name: getFunctionName(reference), args });
      return "new-question";
    },
  };
});
vi.mock("@/features/host/shared/useHostQuery", () => ({ useHostQuery: () => undefined }));

const question = {
  _id: "q1" as Id<"questions">,
  _creationTime: 0,
  quizId: "quiz" as Id<"quizzes">,
  roundId: "r1" as Id<"rounds">,
  position: 1,
  prompt: "Vilken bro?",
  timeLimitSeconds: null,
  media: null,
  hostNotes: "",
  content: { type: "activity", maxPoints: 1 },
  filmId: "f1",
} as Doc<"questions">;

function renderCard(canAddQuestion = true, onSelectQuestion = vi.fn()) {
  render(
    <FilmCard
      roundId={"r1" as Id<"rounds">}
      film={{ id: "f1", video: null }}
      filmNumber={2}
      questions={[{ question, number: 3 }]}
      canAddQuestion={canAddQuestion}
      selectedQuestionId={null}
      onSelectQuestion={onSelectQuestion}
    />,
  );
  return onSelectQuestion;
}

describe("FilmCard", () => {
  beforeEach(() => {
    calls.length = 0;
  });

  it("shows the film's number, its upload field and its questions", () => {
    renderCard();
    expect(screen.getByRole("region", { name: "Film 2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ladda upp film" })).toBeInTheDocument();
    expect(screen.getByText(/F3/)).toBeInTheDocument();
  });

  it("adds a question to the film and selects it", async () => {
    const onSelectQuestion = renderCard();
    await userEvent.click(screen.getByRole("button", { name: "Lägg till fråga" }));
    expect(calls).toContainEqual({ name: "rounds/filmMutations:addFilmQuestion", args: { roundId: "r1", filmId: "f1", type: "multipleChoice" } });
    expect(onSelectQuestion).toHaveBeenCalledWith("new-question");
  });

  it("offers no new question when the round is full", () => {
    renderCard(false);
    expect(screen.queryByRole("button", { name: "Lägg till fråga" })).not.toBeInTheDocument();
  });

  it("deletes the film after confirmation", async () => {
    renderCard();
    await userEvent.click(screen.getByRole("button", { name: "Ta bort film" }));
    expect(await screen.findByText("Filmen och dess fråga tas bort. Det går inte att ångra.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Ta bort" }));
    await act(async () => {});
    expect(calls).toContainEqual({ name: "rounds/filmMutations:deleteFilm", args: { roundId: "r1", filmId: "f1" } });
  });
});
