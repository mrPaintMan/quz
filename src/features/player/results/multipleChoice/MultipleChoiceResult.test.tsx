import { render, screen, within } from "@testing-library/react";
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

  it("marks a wrong pick with ✕, and outlines the right option in gold", () => {
    render(<MultipleChoiceResult shown={shown} answer={picked(1)} outcome={outcomeOf(part("wrong"))} imageUrls={{}} revealed={{ ...shown, correctIndex: 2 }} teamId="t1" />);
    expect(within(screen.getByLabelText("B Norge ert svar")).getByRole("img", { name: "Fel" })).toBeInTheDocument();
    expect(screen.getByLabelText("C Danmark")).toHaveClass("border-primary");
    expect(within(screen.getByLabelText("C Danmark")).getByText("Rätt svar")).toBeInTheDocument();
    expect(document.querySelector(".result-lit")).toBeNull();
  });
});
