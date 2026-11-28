import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { ActionErrorProvider } from "@/features/host/shared/ActionErrorProvider";
import { JulquizSwitch } from "./JulquizSwitch";

const updateQuiz = vi.fn().mockResolvedValue(undefined);
vi.mock("@/features/host/shared/useHostMutation", () => ({ useHostMutation: () => updateQuiz }));

const quiz = (isChristmas?: boolean) => ({ _id: "quiz" as Id<"quizzes">, title: "Julquiz", isChristmas }) as Doc<"quizzes">;

describe("JulquizSwitch", () => {
  it("shows whether the quiz is a Julquiz, off for one never set", () => {
    render(<JulquizSwitch quiz={quiz()} />);
    expect(screen.getByRole("switch", { name: "Julquiz" })).not.toBeChecked();
  });

  it("makes the quiz a Julquiz, and back", async () => {
    const { rerender } = render(
      <ActionErrorProvider>
        <JulquizSwitch quiz={quiz(false)} />
      </ActionErrorProvider>,
    );
    await userEvent.click(screen.getByRole("switch", { name: "Julquiz" }));
    expect(updateQuiz).toHaveBeenLastCalledWith({ quizId: "quiz", isChristmas: true });
    rerender(
      <ActionErrorProvider>
        <JulquizSwitch quiz={quiz(true)} />
      </ActionErrorProvider>,
    );
    expect(screen.getByRole("switch", { name: "Julquiz" })).toBeChecked();
    await userEvent.click(screen.getByRole("switch", { name: "Julquiz" }));
    expect(updateQuiz).toHaveBeenLastCalledWith({ quizId: "quiz", isChristmas: false });
  });
});
