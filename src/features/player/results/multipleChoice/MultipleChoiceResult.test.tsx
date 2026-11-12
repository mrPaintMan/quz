import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { outcomeOf, part } from "@/features/player/results/resultTestParts.setup";
import { MultipleChoiceResult } from "./MultipleChoiceResult";

const shown = { type: "multipleChoice" as const, options: ["Sverige", "Norge", "Danmark"].map((text) => ({ text, imageId: null })) };
const picked = (optionIndex: number) => ({ type: "multipleChoice" as const, optionIndex });

describe("MultipleChoiceResult", () => {
  it("lights the team's pick in gold with its points when right", () => {
    render(<MultipleChoiceResult shown={shown} answer={picked(2)} outcome={outcomeOf(part("right", 2))} imageUrls={{}} revealed={null} teamId="t1" />);
    expect(screen.getByLabelText("C Danmark ert svar")).toHaveClass("result-lit");
    expect(screen.getByText("+2 p")).toBeInTheDocument();
    expect(screen.getByLabelText("A Sverige")).not.toHaveClass("result-lit");
  });

  it("lights a wrong pick in red, without showing the right option", () => {
    render(<MultipleChoiceResult shown={shown} answer={picked(1)} outcome={outcomeOf(part("wrong"))} imageUrls={{}} revealed={null} teamId="t1" />);
    expect(screen.getByLabelText("B Norge ert svar")).toHaveClass("result-missed");
    expect(screen.getByText("Ert svar · 0 p")).toBeInTheDocument();
    expect(document.querySelector(".result-lit")).toBeNull();
  });
});
