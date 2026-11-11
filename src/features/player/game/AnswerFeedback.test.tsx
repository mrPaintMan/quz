import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { AnswerFeedback } from "./AnswerFeedback";

const feedback = vi.fn();
vi.mock("convex/react", () => ({ useQuery: () => feedback() }));

const teamId = "t1" as Id<"teams">;

describe("AnswerFeedback", () => {
  it("marks each part of the team's answer and gives its points", () => {
    feedback.mockReturnValue({
      prompt: "Vem och vad?",
      outcome: {
        points: 2.5,
        parts: [
          { label: "a) Artist", given: "Abbba", result: "right", correct: "ABBA" },
          { label: "b) Låt", given: "Mamma mia", result: "wrong", correct: "Waterloo" },
          { label: "c) År", given: "", result: "wrong", correct: "" },
          { label: "", given: "Lund", result: "pending", correct: "" },
          { label: "", given: "Lunds stad", result: "repeat", correct: "" },
        ],
      },
    });
    render(<AnswerFeedback teamId={teamId} />);
    expect(screen.getByText("Vem och vad?")).toBeInTheDocument();
    expect(screen.getAllByRole("img").map((mark) => mark.getAttribute("aria-label"))).toEqual(["Rätt", "Fel", "Fel", "Bedöms", "Räknas redan"]);
    expect(screen.queryByText("Rätt svar: ABBA")).not.toBeInTheDocument();
    expect(screen.getByText("Rätt svar: Waterloo")).toBeInTheDocument();
    expect(screen.getByText("Inget svar")).toBeInTheDocument();
    expect(screen.getByText("Bedöms…")).toBeInTheDocument();
    expect(screen.getByText("Räknas redan")).toBeInTheDocument();
    expect(screen.getByText("Ni har fått 2,5 p än så länge.")).toBeInTheDocument();
  });

  it("gives the points as final once nothing waits for a verdict", () => {
    feedback.mockReturnValue({ prompt: "Vilken krydda?", outcome: { points: 2, parts: [{ label: "", given: "Saffran", result: "right", correct: "Saffran" }] } });
    render(<AnswerFeedback teamId={teamId} />);
    expect(screen.getByText("Ni fick 2 p")).toBeInTheDocument();
  });

  it("says when the team didn't answer", () => {
    feedback.mockReturnValue({ prompt: "Vilken krydda?", outcome: null });
    render(<AnswerFeedback teamId={teamId} />);
    expect(screen.getByText("Ni svarade inte.")).toBeInTheDocument();
  });

  it("shows nothing while a question shows or before any answer is out", () => {
    feedback.mockReturnValue(null);
    const { container } = render(<AnswerFeedback teamId={teamId} />);
    expect(container).toBeEmptyDOMElement();
  });
});
