import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { outcomeOf, part } from "@/features/player/results/resultTestParts.setup";
import { NumberResult } from "./NumberResult";

const props = { shown: { type: "number" as const }, answer: { type: "number" as const, value: 8 }, imageUrls: {}, revealed: null, teamId: "t1" };

describe("NumberResult", () => {
  it("lights the guess with its points when it scored", () => {
    render(<NumberResult {...props} outcome={outcomeOf(part("right", 2, "8"))} />);
    expect(screen.getByText("8")).toHaveClass("result-lit");
    expect(screen.getByText("+2 p")).toBeInTheDocument();
  });

  it("shows a guess that scored nothing as it was typed", () => {
    render(<NumberResult {...props} outcome={outcomeOf(part("wrong", 0, "8"))} />);
    expect(screen.getByText("8")).not.toHaveClass("result-lit");
  });
});
