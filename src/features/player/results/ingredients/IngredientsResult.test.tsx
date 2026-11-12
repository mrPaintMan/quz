import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { outcomeOf, part } from "@/features/player/results/resultTestParts.setup";
import { IngredientsResult } from "./IngredientsResult";

describe("IngredientsResult", () => {
  it("shows the numbered fields, each ingredient that scored lit and a repeat faded with why", () => {
    const answer = { type: "ingredients" as const, items: ["Glögg", "", "Kahlua", "kaffelikör"] };
    render(
      <IngredientsResult
        shown={{ type: "ingredients", count: 4 }}
        answer={answer}
        outcome={outcomeOf(part("right", 1, "", 0), part("right", 1, "", 2), part("repeat", 0, "", 3))}
        imageUrls={{}} revealed={null} teamId="t1"
      />,
    );
    expect(screen.getByText("4 ingredienser · ordningen spelar ingen roll")).toBeInTheDocument();
    expect(screen.getByText("Glögg").parentElement).toHaveClass("result-lit");
    expect(screen.getByText("Ingrediens 2")).toBeInTheDocument();
    expect(screen.getByText("kaffelikör").parentElement).toHaveClass("opacity-45");
    expect(screen.getByText("Räknas redan")).toBeInTheDocument();
    expect(screen.getAllByText("+1 p")).toHaveLength(2);
  });
});
