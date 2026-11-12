import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { outcomeOf, part } from "@/features/player/results/resultTestParts.setup";
import { FreeTextResult } from "./FreeTextResult";

describe("FreeTextResult", () => {
  it("shows each field under its sub-question, lit when it scored and waiting while judged", () => {
    const shown = { type: "freeText" as const, labels: ["Artist", "Låt", "År"] };
    const answer = { type: "freeText" as const, fields: ["Abbba", "Mamma mia", "1980"] };
    render(<FreeTextResult shown={shown} answer={answer} outcome={outcomeOf(part("right"), part("wrong"), part("pending"))} imageUrls={{}} revealed={null} teamId="t1" />);
    expect(screen.getByText("a) Artist")).toBeInTheDocument();
    expect(screen.getByText("Abbba").parentElement).toHaveClass("result-lit");
    expect(screen.getByText("Mamma mia").parentElement).not.toHaveClass("result-lit");
    expect(screen.getByText("Bedöms…")).toBeInTheDocument();
  });

  it("calls a single field Ert svar", () => {
    render(<FreeTextResult shown={{ type: "freeText", labels: [""] }} answer={{ type: "freeText", fields: ["Kanel"] }} outcome={outcomeOf(part("wrong"))} imageUrls={{}} revealed={null} teamId="t1" />);
    expect(screen.getByText("Ert svar")).toBeInTheDocument();
  });
});
