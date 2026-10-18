import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { QuestionListItem } from "./QuestionListItem";

const question = (prompt: string, maxPoints: number): Doc<"questions"> => ({
  _id: "q1" as Id<"questions">,
  _creationTime: 0,
  quizId: "quiz" as Id<"quizzes">,
  roundId: "r1" as Id<"rounds">,
  position: 0,
  prompt,
  timeLimitSeconds: null,
  media: null,
  hostNotes: "",
  content: { type: "activity", maxPoints },
});

describe("QuestionListItem", () => {
  it("shows number, type, points and prompt of a ready question", () => {
    render(<QuestionListItem question={question("Pepparkakshus", 5)} number={2} selected={false} onSelect={vi.fn()} />);
    expect(screen.getByText("F2 · Aktivitet")).toBeInTheDocument();
    expect(screen.getByText("5 p")).toBeInTheDocument();
    expect(screen.getByText("Pepparkakshus")).toBeInTheDocument();
    expect(screen.queryByText("Ej klar")).not.toBeInTheDocument();
  });

  it("marks an unfinished question and selects it on click", async () => {
    const onSelect = vi.fn();
    render(<QuestionListItem question={question("", 1)} number={1} selected onSelect={onSelect} />);
    expect(screen.getByText("Ingen frågetext ännu")).toBeInTheDocument();
    expect(screen.getByText("Ej klar")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { current: true }));
    expect(onSelect).toHaveBeenCalled();
  });

  it("offers moving when given a position and a drag handle", async () => {
    const onMove = vi.fn();
    render(
      <QuestionListItem
        question={question("A", 1)}
        number={1}
        selected={false}
        onSelect={vi.fn()}
        dragHandle={<button type="button">Handtag</button>}
        position={{ index: 0, count: 2, onMove }}
      />,
    );
    expect(screen.getByRole("button", { name: "Handtag" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Flytta ned fråga 1" }));
    expect(onMove).toHaveBeenCalledWith(1);
  });
});
