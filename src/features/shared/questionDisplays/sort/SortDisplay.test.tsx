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

  it("puts more than five items in two columns, read down the first", () => {
    const items = ["A", "B", "C", "D", "E", "F"];
    render(<SortQuestion shown={{ type: "sort", items, ...labels }} imageUrls={{}} />);
    expect(screen.getByRole("list")).toHaveStyle({ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gridTemplateRows: "repeat(3, auto)" });
  });

  it("keeps five or fewer in one column", () => {
    render(<SortQuestion shown={{ type: "sort", items: ["A", "B"], ...labels }} imageUrls={{}} />);
    expect(screen.getByRole("list")).toHaveStyle({ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" });
  });
});
