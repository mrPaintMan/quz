import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { IngredientsAnswer, IngredientsQuestion } from "./IngredientsDisplay";

describe("IngredientsQuestion", () => {
  it("adds nothing to the question", () => {
    const { container } = render(<IngredientsQuestion />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("IngredientsAnswer", () => {
  it("lists the ingredients, numbered", () => {
    render(<IngredientsAnswer revealed={{ type: "ingredients", items: ["Vodka", "Kahlúa"] }} imageUrls={{}} />);
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual(["1Vodka", "2Kahlúa"]);
  });

  it("uses two columns for many ingredients", () => {
    render(<IngredientsAnswer revealed={{ type: "ingredients", items: ["a", "b", "c", "d", "e", "f"] }} imageUrls={{}} />);
    expect(screen.getByRole("list")).toHaveClass("grid-cols-2");
  });
});
