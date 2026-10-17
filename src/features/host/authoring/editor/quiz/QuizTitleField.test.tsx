import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { QuizTitleField } from "./QuizTitleField";

const updateQuiz = vi.fn().mockResolvedValue(undefined);
vi.mock("@/features/host/shared/useHostMutation", () => ({ useHostMutation: () => updateQuiz }));

describe("QuizTitleField", () => {
  it("autosaves the quiz's name", async () => {
    const quiz = { _id: "quiz" as Id<"quizzes">, title: "Julquiz" } as Doc<"quizzes">;
    render(<QuizTitleField quiz={quiz} />);
    await userEvent.type(screen.getByLabelText("Quizets namn"), " 2026");
    await vi.waitFor(() => expect(updateQuiz).toHaveBeenCalledWith({ quizId: "quiz", title: "Julquiz 2026" }));
  });

  it("says when the name could not be saved", async () => {
    updateQuiz.mockRejectedValueOnce(new Error("offline"));
    const quiz = { _id: "quiz" as Id<"quizzes">, title: "Julquiz" } as Doc<"quizzes">;
    render(<QuizTitleField quiz={quiz} />);
    await userEvent.type(screen.getByLabelText("Quizets namn"), "!");
    expect(await screen.findByRole("alert")).toHaveTextContent("Kunde inte spara namnet.");
  });
});
