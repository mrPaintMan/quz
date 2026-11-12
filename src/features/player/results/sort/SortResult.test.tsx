import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { outcomeOf, part } from "@/features/player/results/resultTestParts.setup";
import { SortResult } from "./SortResult";

describe("SortResult", () => {
  it("shows the team's order between the labels, each place that scored lit with its points", () => {
    const shown = { type: "sort" as const, items: ["A", "B", "C"], firstLabel: "Äldst", lastLabel: "Nyast" };
    const answer = { type: "sort" as const, order: ["Titanic", "Avatar", "Barbie"] };
    render(<SortResult shown={shown} answer={answer} outcome={outcomeOf(part("right"), part("wrong"), part("right"))} imageUrls={{}} revealed={null} teamId="t1" />);
    expect(screen.getByText("Äldst")).toBeInTheDocument();
    const rows = screen.getAllByRole("listitem");
    expect(rows.map((row) => row.textContent)).toEqual(["1Titanic+1 p", "2Avatar", "3Barbie+1 p"]);
    expect(rows.map((row) => row.classList.contains("result-lit"))).toEqual([true, false, true]);
    expect(rows[2]).toHaveStyle({ animationDelay: "150ms" });
  });
});
