import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { dragByKeyboard } from "@/features/host/authoring/shared/dragByKeyboard.setup";
import { RoundList } from "./RoundList";

const calls: { name: string; args: unknown }[] = [];
vi.mock("@/features/host/shared/useHostMutation", async () => {
  const { getFunctionName } = await vi.importActual<typeof import("convex/server")>("convex/server");
  return {
    useHostMutation: (reference: Parameters<typeof getFunctionName>[0]) => async (args: unknown) => {
      calls.push({ name: getFunctionName(reference), args });
      return "new-round";
    },
  };
});

const questions = (count: number) => Array.from({ length: count }, () => ({}) as Doc<"questions">);
const round = (id: string, title: string, kind: "questions" | "paSparet", count: number) => ({
  _id: id as Id<"rounds">,
  _creationTime: 0,
  quizId: "quiz" as Id<"quizzes">,
  position: 0,
  title,
  kind,
  questions: questions(count),
});

const rounds = [round("a", "Julmusik", "questions", 1), round("b", "Julmat", "questions", 3), round("c", "På spåret", "paSparet", 2)];

describe("RoundList", () => {
  beforeEach(() => {
    calls.length = 0;
  });

  it("lists rounds with their question or trip counts", () => {
    render(<RoundList quizId={"quiz" as Id<"quizzes">} rounds={[...rounds, round("d", "Resa", "paSparet", 1)]} selectedRoundId={null} onSelectRound={vi.fn()} />);
    expect(screen.getByText("1 fråga")).toBeInTheDocument();
    expect(screen.getByText("3 frågor")).toBeInTheDocument();
    expect(screen.getByText("2 resor")).toBeInTheDocument();
    expect(screen.getByText("1 resa")).toBeInTheDocument();
  });

  it("selects a round", async () => {
    const onSelectRound = vi.fn();
    render(<RoundList quizId={"quiz" as Id<"quizzes">} rounds={rounds} selectedRoundId={"a" as Id<"rounds">} onSelectRound={onSelectRound} />);
    await userEvent.click(screen.getByText("2. Julmat"));
    expect(onSelectRound).toHaveBeenCalledWith("b");
  });

  it("moves a round dragged by its handle", async () => {
    render(<RoundList quizId={"quiz" as Id<"quizzes">} rounds={rounds} selectedRoundId={null} onSelectRound={vi.fn()} />);
    await dragByKeyboard("Dra för att flytta omgång 3", "up");
    expect(calls).toEqual([{ name: "rounds/mutations:moveRound", args: { roundId: "c", toIndex: 1 } }]);
  });

  it("adds a round and selects it", async () => {
    const onSelectRound = vi.fn();
    render(<RoundList quizId={"quiz" as Id<"quizzes">} rounds={rounds} selectedRoundId={null} onSelectRound={onSelectRound} />);
    await userEvent.type(screen.getByLabelText("Ny omgång"), "Julfilmer");
    await userEvent.click(screen.getByRole("button", { name: "Lägg till omgång" }));
    expect(calls).toContainEqual({ name: "rounds/mutations:addRound", args: { quizId: "quiz", title: "Julfilmer", kind: "questions" } });
    expect(onSelectRound).toHaveBeenCalledWith("new-round");
  });
});
