import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { HostSessionProvider } from "@/features/host/shared/HostSessionProvider";
import { QuizEditor } from "./QuizEditor";

const tree = vi.fn();
vi.mock("@/features/host/shared/useHostQuery", () => ({ useHostQuery: () => tree() }));
vi.mock("@/features/host/shared/useHostMutation", () => ({ useHostMutation: () => vi.fn().mockResolvedValue(undefined) }));

const question = (id: string, roundId: string, prompt: string): Doc<"questions"> => ({
  _id: id as Id<"questions">,
  _creationTime: 0,
  quizId: "quiz" as Id<"quizzes">,
  roundId: roundId as Id<"rounds">,
  position: 0,
  prompt,
  timeLimitSeconds: null,
  media: null,
  hostNotes: "",
  content: { type: "activity", maxPoints: 1 },
});

const round = (id: string, title: string, questions: Doc<"questions">[]) => ({
  _id: id as Id<"rounds">,
  _creationTime: 0,
  quizId: "quiz" as Id<"quizzes">,
  position: 0,
  title,
  kind: "questions" as const,
  questions,
});

const quiz: Doc<"quizzes"> = { _id: "quiz" as Id<"quizzes">, _creationTime: 0, title: "Julquiz 2026", year: 2026, updatedAt: Date.now() };

function renderEditor() {
  render(
    <HostSessionProvider session={{ passphrase: "p", logOut: vi.fn() }}>
      <QuizEditor quizId={"quiz" as Id<"quizzes">} />
    </HostSessionProvider>,
  );
}

describe("QuizEditor", () => {
  beforeEach(() => {
    tree.mockReset();
    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
  });

  it("says it is loading", () => {
    tree.mockReturnValue(undefined);
    renderEditor();
    expect(screen.getByText("Hämtar quizet…")).toBeInTheDocument();
  });

  it("says when the quiz no longer exists", () => {
    tree.mockReturnValue(null);
    renderEditor();
    expect(screen.getByRole("link", { name: "Till dina quiz" })).toHaveAttribute("href", "/admin");
  });

  it("guides an empty quiz to its first round", () => {
    tree.mockReturnValue({ quiz, rounds: [] });
    renderEditor();
    expect(screen.getByText("Börja med att lägga till en rond.")).toBeInTheDocument();
    expect(screen.getByLabelText("Quizets namn")).toHaveValue("Julquiz 2026");
    expect(screen.getByText("Sparat just nu")).toBeInTheDocument();
  });

  it("scrolls to the question editor when a question is picked on a phone", async () => {
    tree.mockReturnValue({
      quiz,
      rounds: [round("r1", "Julmat", [question("q1", "r1", "Lussekatter"), question("q2", "r1", "Glögg")])],
    });
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
    renderEditor();
    await userEvent.click(screen.getByText("Glögg"));
    expect(scrollIntoView).toHaveBeenCalled();

    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
    scrollIntoView.mockClear();
    await userEvent.click(screen.getByText("Lussekatter"));
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("opens the first question and follows the selection between rounds and questions", async () => {
    tree.mockReturnValue({
      quiz,
      rounds: [
        round("r1", "Julmat", [question("q1", "r1", "Lussekatter"), question("q2", "r1", "Glögg")]),
        round("r2", "Julfilmer", []),
      ],
    });
    renderEditor();
    expect(screen.getByLabelText("Fråga som visas på TV:n")).toHaveValue("Lussekatter");
    await userEvent.click(screen.getByText("Glögg"));
    expect(screen.getByLabelText("Fråga som visas på TV:n")).toHaveValue("Glögg");
    await userEvent.click(screen.getByRole("button", { name: /2\. Julfilmer/ }));
    expect(screen.getByText("Välj eller lägg till en fråga.")).toBeInTheDocument();
  });
});
