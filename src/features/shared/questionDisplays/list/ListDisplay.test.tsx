import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ListAnswer, ListQuestion } from "./ListDisplay";

const items = (count: number) => Array.from({ length: count }, (_, index) => ({ name: `Stad ${index + 1}`, teamCount: 1 }));

describe("ListQuestion", () => {
  it("adds nothing to the question", () => {
    const { container } = render(<ListQuestion />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("ListAnswer", () => {
  it("shows each item the teams got right with how many teams got it", () => {
    render(<ListAnswer revealed={{ type: "list", items: [{ name: "Göteborg", teamCount: 3 }, { name: "Malmö", teamCount: 1 }] }} imageUrls={{}} />);
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual(["Göteborg3 lag", "Malmö1 lag"]);
    expect(screen.getByRole("list")).toHaveClass("grid-cols-1");
  });

  it("says when no one has anything right yet", () => {
    render(<ListAnswer revealed={{ type: "list", items: [] }} imageUrls={{}} />);
    expect(screen.getByText("Inga rätta svar ännu.")).toBeInTheDocument();
  });

  it("uses more columns for more items, and counts those that don't fit", () => {
    render(<ListAnswer revealed={{ type: "list", items: items(45) }} imageUrls={{}} />);
    expect(screen.getByRole("list")).toHaveClass("grid-cols-4");
    expect(screen.getAllByRole("listitem")).toHaveLength(40);
    expect(screen.getByText("och 5 till")).toBeInTheDocument();
  });
});
