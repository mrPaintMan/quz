import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { outcomeOf, part } from "@/features/player/results/resultTestParts.setup";
import { SortResult } from "./SortResult";

describe("SortResult", () => {
  it("shows the team's order between the labels, each place that scored lit, a wrong one red with its right place", () => {
    const shown = { type: "sort" as const, items: ["A", "B", "C"], firstLabel: "Äldst", lastLabel: "Nyast" };
    const answer = { type: "sort" as const, order: ["Titanic", "Avatar", "Barbie"] };
    // Each place's part names the item that belongs there: Titanic, Barbie, Avatar.
    const placed = (result: "right" | "wrong", correct: string) => ({ ...part(result), correct });
    render(<SortResult shown={shown} answer={answer} outcome={outcomeOf(placed("right", "Titanic"), placed("wrong", "Barbie"), placed("wrong", "Avatar"))} imageUrls={{}} revealed={null} teamId="t1" />);
    expect(screen.getByText("Äldst")).toBeInTheDocument();
    const rows = screen.getAllByRole("listitem");
    expect(rows.map((row) => row.textContent)).toEqual(["1Titanic+1 p", "2Avatarrätt plats: 3✕ 0 p", "3Barbierätt plats: 2✕ 0 p"]);
    expect(rows.map((row) => row.classList.contains("result-lit"))).toEqual([true, false, false]);
    expect(rows[1]).toHaveClass("result-missed");
  });
});
