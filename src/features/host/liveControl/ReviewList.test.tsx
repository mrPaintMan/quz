import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { ActionErrorProvider } from "@/features/host/shared/ActionErrorProvider";
import { ReviewList, type Review } from "./ReviewList";

const judgeText = vi.fn();
vi.mock("@/features/host/shared/useHostMutation", () => ({ useHostMutation: () => judgeText }));
vi.mock("./AllAnswers", () => ({ AllAnswers: ({ prompt, unjudged }: { prompt: string; unjudged: number }) => <button>{`Visa alla svar: ${prompt}, ${unjudged}`}</button> }));

const gameId = "game1" as Id<"games">;
const questionId = "q1" as Id<"questions">;
const slot = (title: string, options: string[], answer: string | null = null) => ({ title, answer, options, isOpen: false, names: [] });
const item = (slotIndex: number, text: string, extra = {}) => ({ slot: slotIndex, text, written: text, teamCount: 1, isJudged: false, target: null, byAi: false, ...extra });

function renderList(review: Pick<Review, "slots" | "items" | "aiStatus"> & Partial<Pick<Review, "exact">>) {
  render(
    <ActionErrorProvider>
      <ReviewList
        gameId={gameId}
        questionId={questionId}
        review={{ exact: [], ...review, phase: "reviewing", unjudged: review.items.filter((candidate) => !candidate.isJudged).length }}
        prompt="Vilken krydda?"
        leaderboard={[]}
      />
    </ActionErrorProvider>,
  );
}

// The rows of a section, in order.
const rowsIn = (section: string) => within(screen.getByText(section).parentElement!).getAllByRole("listitem");

describe("ReviewList", () => {
  beforeEach(() => {
    judgeText.mockReset().mockResolvedValue(null);
  });

  it("says when no team has sent anything yet", () => {
    renderList({ slots: [slot("", ["Saffran"])], items: [], aiStatus: null });
    expect(screen.getByText("Inga svar ännu.")).toBeInTheDocument();
  });

  it("shows only the texts no one has judged yet, and every answer behind Visa alla svar", () => {
    renderList({
      slots: [slot("", ["Saffran"])],
      items: [item(0, "safran", { isJudged: true, target: 0, byAi: true }), item(0, "gurkmeja")],
      exact: [{ slot: 0, text: "saffran", written: "Saffran", teamCount: 3, answer: "Saffran" }],
      aiStatus: "done",
    });
    expect(screen.getAllByRole("heading", { level: 4 }).map((heading) => heading.textContent)).toEqual(["Att granska"]);
    expect(rowsIn("Att granska").map((row) => row.textContent)).toEqual([expect.stringContaining("gurkmeja")]);
    expect(screen.queryByText("safran")).not.toBeInTheDocument();
    expect(screen.queryByText("Saffran", { selector: "span" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Visa alla svar: Vilken krydda?, 1" })).toBeInTheDocument();
  });

  it("gives each sub-question's correct answer by its title, and judges for every team that wrote a text", async () => {
    renderList({
      slots: [slot("a) Artist", ["ABBA"], "ABBA"), slot("b) Låt", ["Waterloo"], "Waterloo"), slot("c) År", [])],
      items: [item(0, "abbba", { written: "Abbba", teamCount: 2 }), item(1, "waterlo", { isJudged: true, target: 0 })],
      aiStatus: null,
    });
    expect(screen.getByText("1 kvar")).toBeInTheDocument();
    expect(screen.getByText("a) Artist · facit: ABBA")).toBeInTheDocument();
    // Its only text is judged, so the sub-question has nothing to show here.
    expect(screen.queryByText("b) Låt · facit: Waterloo")).not.toBeInTheDocument();
    expect(screen.queryByText(/c\) År/)).not.toBeInTheDocument();
    const abbba = within(screen.getByText("Abbba").closest("li")!);
    expect(abbba.getByText("2 lag")).toBeInTheDocument();
    await userEvent.click(abbba.getByRole("button", { name: "Rätt" }));
    expect(judgeText).toHaveBeenCalledWith({ gameId, questionId, slot: 0, text: "abbba", target: 0 });
    await userEvent.click(abbba.getByRole("button", { name: "Fel" }));
    expect(judgeText).toHaveBeenLastCalledWith({ gameId, questionId, slot: 0, text: "abbba", target: null });
  });

  it("asks which ingredient a text counts as", async () => {
    renderList({ slots: [slot("", ["Vodka", "Kahlúa"])], items: [item(0, "kahlua")], aiStatus: null });
    await userEvent.click(screen.getByRole("button", { name: "Kahlúa" }));
    expect(judgeText).toHaveBeenCalledWith({ gameId, questionId, slot: 0, text: "kahlua", target: 1 });
  });

  it("says when everything is judged, and where to change a verdict", () => {
    renderList({ slots: [slot("", ["Saffran"])], items: [item(0, "kahlua", { isJudged: true, target: null })], aiStatus: null });
    expect(screen.getByText("Allt granskat")).toBeInTheDocument();
    expect(screen.getByText("Ändra en bedömning under alla svar.")).toBeInTheDocument();
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("says while the AI judges", () => {
    renderList({ slots: [slot("", ["Saffran"])], items: [item(0, "gurkmeja")], aiStatus: "judging" });
    expect(screen.getByText("AI:n bedömer svaren…")).toBeInTheDocument();
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
