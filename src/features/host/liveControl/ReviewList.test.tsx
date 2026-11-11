import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { ActionErrorProvider } from "@/features/host/shared/ActionErrorProvider";
import { ReviewList, type Review } from "./ReviewList";

const judgeText = vi.fn();
vi.mock("@/features/host/shared/useHostMutation", () => ({ useHostMutation: () => judgeText }));

const gameId = "game1" as Id<"games">;
const questionId = "q1" as Id<"questions">;
const slot = (title: string, options: string[]) => ({ title, options, isOpen: false, names: [] });
const item = (slot: number, text: string, extra = {}) => ({ slot, text, written: text, teamCount: 1, isJudged: false, target: null, byAi: false, ...extra });

function renderList(review: Omit<Review, "phase">) {
  render(
    <ActionErrorProvider>
      <ReviewList gameId={gameId} questionId={questionId} review={{ ...review, phase: "reviewing" }} />
    </ActionErrorProvider>,
  );
}

describe("ReviewList", () => {
  beforeEach(() => {
    judgeText.mockReset().mockResolvedValue(null);
  });

  it("says when there is nothing to judge", () => {
    renderList({ slots: [slot("", ["Saffran"])], items: [], aiStatus: null });
    expect(screen.getByText("Inga svar att granska.")).toBeInTheDocument();
  });

  it("judges a free-text answer right or wrong, for every team that wrote it", async () => {
    renderList({
      slots: [
        slot("a) Artist", ["ABBA"]),
        slot("b) Låt", ["Waterloo"]),
      ],
      items: [item(0, "abbba", { written: "Abbba", teamCount: 2 }), item(1, "waterlo", { isJudged: true, target: 0 })],
      aiStatus: null,
    });
    expect(screen.getByText("1 kvar")).toBeInTheDocument();
    expect(screen.getByText("b) Låt")).toBeInTheDocument();
    const abbba = within(screen.getByText("Abbba").closest("li")!);
    expect(abbba.getByText("2 lag")).toBeInTheDocument();
    await userEvent.click(abbba.getByRole("button", { name: "Rätt" }));
    expect(judgeText).toHaveBeenCalledWith({ gameId, questionId, slot: 0, text: "abbba", target: 0 });
    const waterlo = within(screen.getByText("waterlo").closest("li")!);
    expect(waterlo.getByRole("button", { name: "Rätt" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(waterlo.getByRole("button", { name: "Fel" }));
    expect(judgeText).toHaveBeenLastCalledWith({ gameId, questionId, slot: 1, text: "waterlo", target: null });
  });

  it("asks which ingredient a text counts as", async () => {
    renderList({ slots: [slot("", ["Vodka", "Kahlúa"])], items: [item(0, "kahlua", { isJudged: true, target: null })], aiStatus: null });
    expect(screen.getByText("Allt granskat")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fel" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(screen.getByRole("button", { name: "Kahlúa" }));
    expect(judgeText).toHaveBeenCalledWith({ gameId, questionId, slot: 0, text: "kahlua", target: 1 });
  });

  it("says while the AI judges, and marks the verdicts it gave", () => {
    renderList({ slots: [slot("", ["Saffran"])], items: [item(0, "safran", { isJudged: true, target: 0, byAi: true }), item(0, "gurkmeja")], aiStatus: "judging" });
    expect(screen.getByText("AI:n bedömer svaren…")).toBeInTheDocument();
    expect(within(screen.getByText("safran").closest("li")!).getByTitle("Bedömt av AI")).toBeInTheDocument();
    expect(within(screen.getByText("gurkmeja").closest("li")!).queryByTitle("Bedömt av AI")).not.toBeInTheDocument();
  });

  it("says when the AI couldn't judge, so the hosts do it themselves", () => {
    renderList({ slots: [slot("", ["Saffran"])], items: [item(0, "safran")], aiStatus: "failed" });
    expect(screen.getByText("AI:n kunde inte bedöma svaren. Granska dem själva.")).toBeInTheDocument();
  });

  it("drops the AI's failure once the hosts have judged everything", () => {
    renderList({ slots: [slot("", ["Saffran"])], items: [item(0, "safran", { isJudged: true, target: 0 })], aiStatus: "failed" });
    expect(screen.getByText("Allt granskat")).toBeInTheDocument();
    expect(screen.queryByText(/AI:n kunde inte/)).not.toBeInTheDocument();
  });
});
