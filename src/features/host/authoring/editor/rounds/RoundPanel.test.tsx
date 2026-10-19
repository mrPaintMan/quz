import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { dragByKeyboard } from "@/features/host/authoring/shared/dragByKeyboard.setup";
import { RoundPanel } from "./RoundPanel";

const calls: { name: string; args: unknown }[] = [];
let failRename = false;
vi.mock("@/features/host/shared/useHostMutation", async () => {
  const { getFunctionName } = await vi.importActual<typeof import("convex/server")>("convex/server");
  return {
    useHostMutation: (reference: Parameters<typeof getFunctionName>[0]) => async (args: unknown) => {
      const name = getFunctionName(reference);
      calls.push({ name, args });
      if (name.endsWith("renameRound") && failRename) throw new Error("offline");
      return name.endsWith("addQuestion") ? "new-question" : undefined;
    },
  };
});

const question = (id: string, prompt: string): Doc<"questions"> => ({
  _id: id as Id<"questions">,
  _creationTime: 0,
  quizId: "quiz" as Id<"quizzes">,
  roundId: "r1" as Id<"rounds">,
  position: 0,
  prompt,
  timeLimitSeconds: null,
  media: null,
  hostNotes: "",
  content: { type: "activity", maxPoints: 1 },
});

const round = (kind: "questions" | "paSparet", questions: Doc<"questions">[]) => ({
  _id: "r1" as Id<"rounds">,
  _creationTime: 0,
  quizId: "quiz" as Id<"quizzes">,
  position: 0,
  title: "Julmat",
  kind,
  questions,
});

describe("RoundPanel", () => {
  beforeEach(() => {
    calls.length = 0;
    failRename = false;
  });

  it("says when the round's name could not be saved", async () => {
    failRename = true;
    render(<RoundPanel round={round("questions", [])} selectedQuestionId={null} onSelectQuestion={vi.fn()} onDeleted={vi.fn()} />);
    await userEvent.type(screen.getByLabelText("Omgångens namn och tema"), "!");
    expect(await screen.findByRole("alert")).toHaveTextContent("Kunde inte spara namnet.");
  });

  it("lists the questions and selects one", async () => {
    const onSelectQuestion = vi.fn();
    render(
      <RoundPanel round={round("questions", [question("a", "A"), question("b", "B")])} selectedQuestionId={"a" as Id<"questions">} onSelectQuestion={onSelectQuestion} onDeleted={vi.fn()} />,
    );
    await userEvent.click(screen.getByText("B"));
    expect(onSelectQuestion).toHaveBeenCalledWith("b");
  });

  it("moves a question within the round when dragged by its handle", async () => {
    render(<RoundPanel round={round("questions", [question("a", "A"), question("b", "B")])} selectedQuestionId={null} onSelectQuestion={vi.fn()} onDeleted={vi.fn()} />);
    await dragByKeyboard("Dra för att flytta fråga 1", "down");
    expect(calls).toEqual([{ name: "questions/mutations:moveQuestion", args: { questionId: "a", toRoundId: "r1", toIndex: 1 } }]);
  });

  it("adds a question of the chosen type and selects it", async () => {
    const onSelectQuestion = vi.fn();
    render(<RoundPanel round={round("questions", [])} selectedQuestionId={null} onSelectQuestion={onSelectQuestion} onDeleted={vi.fn()} />);
    expect(screen.getByText("Inga frågor ännu.")).toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText("Ny fråga av typen"), "Gissa siffran");
    await userEvent.click(screen.getByRole("button", { name: "Lägg till fråga" }));
    expect(calls).toContainEqual({ name: "questions/mutations:addQuestion", args: { roundId: "r1", type: "number" } });
    expect(onSelectQuestion).toHaveBeenCalledWith("new-question");
  });

  it("adds trips without a type choice in a På spåret round", async () => {
    render(<RoundPanel round={round("paSparet", [])} selectedQuestionId={null} onSelectQuestion={vi.fn()} onDeleted={vi.fn()} />);
    expect(screen.getByText("Inga resor ännu.")).toBeInTheDocument();
    expect(screen.queryByLabelText("Ny fråga av typen")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Lägg till resa" }));
    expect(calls).toContainEqual({ name: "questions/mutations:addQuestion", args: { roundId: "r1", type: "paSparet" } });
  });

  it("autosaves the round's name", async () => {
    render(<RoundPanel round={round("questions", [])} selectedQuestionId={null} onSelectQuestion={vi.fn()} onDeleted={vi.fn()} />);
    await userEvent.type(screen.getByLabelText("Omgångens namn och tema"), "!");
    await vi.waitFor(() =>
      expect(calls).toContainEqual({ name: "rounds/mutations:renameRound", args: { roundId: "r1", title: "Julmat!" } }),
    );
  });

  it("deletes the round after confirmation", async () => {
    const onDeleted = vi.fn();
    render(<RoundPanel round={round("questions", [question("a", "A")])} selectedQuestionId={null} onSelectQuestion={vi.fn()} onDeleted={onDeleted} />);
    await userEvent.click(screen.getByRole("button", { name: "Ta bort omgång" }));
    expect(await screen.findByText("Omgången och dess 1 frågor tas bort. Det går inte att ångra.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Ta bort" }));
    await act(async () => {});
    expect(calls).toContainEqual({ name: "rounds/mutations:deleteRound", args: { roundId: "r1" } });
    expect(onDeleted).toHaveBeenCalled();
  });
});
