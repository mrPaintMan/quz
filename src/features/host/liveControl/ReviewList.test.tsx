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
const item = (slotIndex: number, text: string, extra = {}) => ({ slot: slotIndex, text, written: text, teamCount: 1, isJudged: false, target: null, byAi: false, ...extra });

function renderList(review: Pick<Review, "slots" | "items" | "aiStatus"> & Partial<Pick<Review, "exact">>) {
  render(
    <ActionErrorProvider>
      <ReviewList
        gameId={gameId}
        questionId={questionId}
        review={{ exact: [], ...review, phase: "reviewing", unjudged: review.items.filter((candidate) => !candidate.isJudged).length }}
      />
    </ActionErrorProvider>,
  );
}

// The texts of a section, in order.
const textsIn = (section: string) =>
  within(screen.getByText(section).parentElement!)
    .getAllByRole("listitem")
    .map((row) => row.firstChild?.textContent);

describe("ReviewList", () => {
  beforeEach(() => {
    judgeText.mockReset().mockResolvedValue(null);
  });

  it("says when no team has sent anything yet", () => {
    renderList({ slots: [slot("", ["Saffran"])], items: [], aiStatus: null });
    expect(screen.getByText("Inga svar ännu.")).toBeInTheDocument();
  });

  it("puts the texts to judge on top, then the judged, then the exact matches, read-only", () => {
    renderList({
      slots: [slot("", ["Saffran"])],
      items: [item(0, "safran", { isJudged: true, target: 0, byAi: true }), item(0, "gurkmeja")],
      exact: [{ slot: 0, text: "saffran", written: "Saffran", teamCount: 3, answer: "Saffran" }],
      aiStatus: "done",
    });
    const headings = screen.getAllByRole("heading", { level: 4 }).map((heading) => heading.textContent);
    expect(headings).toEqual(["Att granska", "Bedömda", "Stämde med facit"]);
    expect(textsIn("Att granska")).toEqual(["gurkmeja"]);
    expect(textsIn("Bedömda")).toEqual(["safranAI"]);
    const exact = within(screen.getByText("Saffran", { selector: "span" }).closest("li")!);
    expect(exact.getByText("3 lag")).toBeInTheDocument();
    expect(exact.getByText("= Saffran")).toBeInTheDocument();
    expect(exact.queryByRole("button")).not.toBeInTheDocument();
  });

  it("gives each sub-question's correct answer by its title, and judges for every team that wrote a text", async () => {
    renderList({
      slots: [slot("a) Artist", ["ABBA"]), slot("b) Låt", ["Waterloo"])],
      items: [item(0, "abbba", { written: "Abbba", teamCount: 2 }), item(1, "waterlo", { isJudged: true, target: 0 })],
      aiStatus: null,
    });
    expect(screen.getByText("1 kvar")).toBeInTheDocument();
    expect(screen.getByText("a) Artist · facit: ABBA")).toBeInTheDocument();
    expect(screen.getByText("b) Låt · facit: Waterloo")).toBeInTheDocument();
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

  it("says when the AI couldn't judge, until the hosts have judged everything", () => {
    renderList({ slots: [slot("", ["Saffran"])], items: [item(0, "safran")], aiStatus: "failed" });
    expect(screen.getByText("AI:n kunde inte bedöma svaren. Granska dem själva.")).toBeInTheDocument();
  });

  it("drops the AI's failure once the hosts have judged everything", () => {
    renderList({ slots: [slot("", ["Saffran"])], items: [item(0, "safran", { isJudged: true, target: 0 })], aiStatus: "failed" });
    expect(screen.getByText("Allt granskat")).toBeInTheDocument();
    expect(screen.queryByText(/AI:n kunde inte/)).not.toBeInTheDocument();
  });
});
