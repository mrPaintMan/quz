import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SortAnswer, SortQuestion } from "./SortDisplay";

const labels = { firstLabel: "Äldst", lastLabel: "Nyast" };

describe("SortQuestion and SortAnswer", () => {
  it("show the items numbered in their order, between the labels", () => {
    render(<SortQuestion shown={{ type: "sort", items: ["Avatar", "Titanic"], ...labels }} imageUrls={{}} />);
    expect(screen.getAllByRole("listitem").map((row) => row.textContent)).toEqual(["1Avatar", "2Titanic"]);
    expect(screen.getByText("Äldst")).toBeInTheDocument();
    expect(screen.getByText("Nyast")).toBeInTheDocument();
  });

  it("show the right order on the answer screen", () => {
    render(<SortAnswer revealed={{ type: "sort", items: ["Titanic", "Avatar"], ...labels }} imageUrls={{}} />);
    expect(screen.getAllByRole("listitem").map((row) => row.textContent)).toEqual(["1Titanic", "2Avatar"]);
  });
});
