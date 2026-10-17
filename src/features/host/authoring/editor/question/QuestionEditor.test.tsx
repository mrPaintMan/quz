import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { QuestionEditor } from "./QuestionEditor";

const calls: { name: string; args: unknown }[] = [];
let failSaves = false;
vi.mock("@/features/host/shared/useHostMutation", async () => {
  const { getFunctionName } = await vi.importActual<typeof import("convex/server")>("convex/server");
  const names: Record<string, string> = {
    "questions/mutations:updateQuestion": "update",
    "questions/mutations:changeQuestionType": "changeType",
    "questions/mutations:deleteQuestion": "delete",
  };
  return {
    useHostMutation: (reference: Parameters<typeof getFunctionName>[0]) => async (args: unknown) => {
      const name = names[getFunctionName(reference)] ?? "other";
      calls.push({ name, args });
      if (name === "update" && failSaves) throw new Error("offline");
    },
  };
});
vi.mock("@/features/host/shared/useHostQuery", () => ({ useHostQuery: () => undefined }));

const round: Doc<"rounds"> = {
  _id: "r1" as Id<"rounds">,
  _creationTime: 0,
  quizId: "quiz" as Id<"quizzes">,
  position: 0,
  title: "Julmat",
  kind: "questions",
};

const question: Doc<"questions"> = {
  _id: "q1" as Id<"questions">,
  _creationTime: 0,
  quizId: "quiz" as Id<"quizzes">,
  roundId: "r1" as Id<"rounds">,
  position: 0,
  prompt: "",
  timeLimitSeconds: null,
  media: null,
  hostNotes: "",
  content: { type: "activity", maxPoints: 1 },
};

describe("QuestionEditor", () => {
  beforeEach(() => {
    calls.length = 0;
    failSaves = false;
  });
  afterEach(() => vi.useRealTimers());

  it("shows the editor for the question's type and what is missing", () => {
    render(<QuestionEditor question={question} round={round} onDeleted={vi.fn()} />);
    expect(screen.getByLabelText("Frågetyp")).toHaveValue("activity");
    expect(screen.getByLabelText("Maxpoäng")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Skriv frågan som visas på TV:n.");
  });

  it("autosaves the prompt, time limit, notes and content together", async () => {
    render(<QuestionEditor question={question} round={round} onDeleted={vi.fn()} />);
    await userEvent.type(screen.getByLabelText("Fråga som visas på TV:n"), "Pepparkakshus");
    await userEvent.type(screen.getByLabelText("Tidsgräns i sekunder (tomt = ingen)"), "60");
    await userEvent.type(screen.getByLabelText("Anteckningar för domarna (visas inte på TV:n)"), "Bäst vinner");
    await userEvent.type(screen.getByLabelText("Maxpoäng"), "0");
    await vi.waitFor(() =>
      expect(calls.at(-1)).toEqual({
        name: "update",
        args: {
          questionId: "q1",
          prompt: "Pepparkakshus",
          timeLimitSeconds: 60,
          hostNotes: "Bäst vinner",
          content: { type: "activity", maxPoints: 10 },
        },
      }),
    );
    expect(screen.getByRole("status")).toHaveTextContent("Frågan är klar.");
  });

  it("clears the time limit back to none", async () => {
    render(<QuestionEditor question={{ ...question, timeLimitSeconds: 30 }} round={round} onDeleted={vi.fn()} />);
    await userEvent.clear(screen.getByLabelText("Tidsgräns i sekunder (tomt = ingen)"));
    await vi.waitFor(() => expect(calls.at(-1)?.args).toMatchObject({ timeLimitSeconds: null }));
  });

  it("warns when a save fails", async () => {
    failSaves = true;
    render(<QuestionEditor question={question} round={round} onDeleted={vi.fn()} />);
    await userEvent.type(screen.getByLabelText("Fråga som visas på TV:n"), "x");
    expect(await screen.findByRole("alert")).toHaveTextContent("Kunde inte spara");
  });

  it("changes type after confirmation", async () => {
    render(<QuestionEditor question={question} round={round} onDeleted={vi.fn()} />);
    await userEvent.selectOptions(screen.getByLabelText("Frågetyp"), "Rita svar");
    await userEvent.click(await screen.findByRole("button", { name: "Byt frågetyp" }));
    expect(calls).toContainEqual({ name: "changeType", args: { questionId: "q1", type: "drawing" } });
  });

  it("deletes the question after confirmation and tells the parent", async () => {
    const onDeleted = vi.fn();
    render(<QuestionEditor question={question} round={round} onDeleted={onDeleted} />);
    await userEvent.click(screen.getByRole("button", { name: "Ta bort fråga" }));
    await userEvent.click(await screen.findByRole("button", { name: "Ta bort" }));
    await act(async () => {});
    expect(calls).toContainEqual({ name: "delete", args: { questionId: "q1" } });
    expect(onDeleted).toHaveBeenCalled();
  });
});
