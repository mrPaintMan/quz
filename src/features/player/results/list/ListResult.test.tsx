import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { outcomeOf, part } from "@/features/player/results/resultTestParts.setup";
import { ListResult } from "./ListResult";

describe("ListResult", () => {
  it("shows the team's list newest first, each answer that scored lit with its points", () => {
    const answer = { type: "list" as const, items: ["Göteborg", "Oslo", "Lund"] };
    render(<ListResult shown={{ type: "list" }} answer={answer} outcome={outcomeOf(part("right", 0.5), part("wrong"), part("pending"))} imageUrls={{}} />);
    expect(screen.getByText("3 svar")).toBeInTheDocument();
    const rows = screen.getAllByRole("listitem");
    expect(rows.map((row) => row.textContent)).toEqual(["LundBedöms…", "Oslo", "Göteborg+0,5 p"]);
    expect(rows[2]).toHaveClass("result-lit");
  });
});
