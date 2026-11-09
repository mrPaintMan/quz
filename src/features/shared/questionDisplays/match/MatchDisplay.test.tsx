import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MatchAnswer, MatchQuestion } from "./MatchDisplay";

describe("MatchQuestion", () => {
  it("shows the two lists side by side", () => {
    render(<MatchQuestion shown={{ type: "match", left: ["Dancing Queen", "The Look"], right: ["Roxette", "ABBA"] }} imageUrls={{}} />);
    const [listA, listB] = screen.getAllByRole("list");
    expect(within(listA).getAllByRole("listitem").map((item) => item.textContent)).toEqual(["Dancing Queen", "The Look"]);
    expect(within(listB).getAllByRole("listitem").map((item) => item.textContent)).toEqual(["Roxette", "ABBA"]);
  });
});

describe("MatchAnswer", () => {
  it("shows the right pairs, one per row", () => {
    const pairs = [
      { left: "Dancing Queen", right: "ABBA" },
      { left: "The Look", right: "Roxette" },
    ];
    render(<MatchAnswer revealed={{ type: "match", pairs }} imageUrls={{}} />);
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual(["Dancing Queen—ABBA", "The Look—Roxette"]);
  });
});
