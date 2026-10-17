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
});
