import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { QuizListItem } from "./QuizListItem";

const quiz: Doc<"quizzes"> = {
  _id: "quiz1" as Id<"quizzes">,
  _creationTime: 0,
  title: "Julquiz 2026",
  year: 2026,
  updatedAt: 0,
};

describe("QuizListItem", () => {
  it("links to the editor and shows when the quiz was saved", () => {
    render(<QuizListItem quiz={quiz} now={120_000} onCopy={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByRole("link", { name: "Julquiz 2026" })).toHaveAttribute("href", "/admin/quizzes/quiz1");
    expect(screen.getByText("2026 · Sparat för 2 min sedan")).toBeInTheDocument();
  });

  it("copies directly and deletes only after confirming", async () => {
    const onCopy = vi.fn();
    const onDelete = vi.fn();
    render(<QuizListItem quiz={quiz} now={0} onCopy={onCopy} onDelete={onDelete} />);
    await userEvent.click(screen.getByRole("button", { name: "Kopiera" }));
    expect(onCopy).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole("button", { name: "Ta bort" }));
    expect(onDelete).not.toHaveBeenCalled();
    await userEvent.click(await screen.findByRole("button", { name: "Ta bort" }));
    expect(onDelete).toHaveBeenCalledOnce();
  });
});
