import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { outcomeOf, part } from "./resultTestParts.setup";
import { QuestionResult } from "./QuestionResult";

const result = vi.fn();
vi.mock("convex/react", () => ({ useQuery: () => result() }));

const teamId = "t1" as Id<"teams">;
const shown = { type: "number" as const };

describe("QuestionResult", () => {
  it("shows the question, the team's answer drawn by its type, and the total", () => {
    result.mockReturnValue({ prompt: "Hur många renar?", shown, imageUrls: {}, answer: { type: "number", value: 9 }, outcome: outcomeOf(part("right", 3, "9")) });
    render(<QuestionResult teamId={teamId} status={null} otherwise={<p>Titta på TV:n.</p>} />);
    expect(screen.getByText("Hur många renar?")).toBeInTheDocument();
    expect(screen.getByText("+3 p")).toBeInTheDocument();
    expect(screen.getByText("Ni fick 3 p")).toBeInTheDocument();
    expect(screen.queryByText("Titta på TV:n.")).not.toBeInTheDocument();
  });

  it("gives the total as so far while a part is being judged", () => {
    result.mockReturnValue({ prompt: "Vilken krydda?", shown: { type: "freeText", labels: [""] }, imageUrls: {}, answer: { type: "freeText", fields: ["Safran"] }, outcome: outcomeOf(part("pending")) });
    render(<QuestionResult teamId={teamId} status={null} otherwise={null} />);
    expect(screen.getByText("Ni har fått 0 p än så länge.")).toBeInTheDocument();
  });

  it("says when the team didn't answer", () => {
    result.mockReturnValue({ prompt: "Hur många renar?", shown, imageUrls: {}, answer: null, outcome: null });
    render(<QuestionResult teamId={teamId} status={null} otherwise={null} />);
    expect(screen.getByText("Ni svarade inte.")).toBeInTheDocument();
  });

  it("shows what the phone shows otherwise when there is no result", () => {
    result.mockReturnValue(null);
    render(<QuestionResult teamId={teamId} status={null} otherwise={<p>Titta på TV:n.</p>} />);
    expect(screen.getByText("Titta på TV:n.")).toBeInTheDocument();
  });

  it("keeps the screen's own line on top on the screens after the answer", () => {
    result.mockReturnValue({ prompt: "Hur många renar?", shown, imageUrls: {}, answer: { type: "number", value: 9 }, outcome: outcomeOf(part("right", 3, "9")) });
    render(<QuestionResult teamId={teamId} status="Titta på filmen." otherwise={null} />);
    expect(screen.getByRole("status")).toHaveTextContent("Titta på filmen.");
  });
});
