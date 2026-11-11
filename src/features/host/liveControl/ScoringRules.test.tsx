import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScoringRules } from "./ScoringRules";

describe("ScoringRules", () => {
  it("names the kind of scoring and lists its rules", () => {
    render(<ScoringRules lines={["Närmast vinner", "Plats 1: 3 p", "Lika nära delar plats."]} />);
    expect(screen.getByRole("heading")).toHaveTextContent("Poängsättning: Närmast vinner");
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual(["Plats 1: 3 p", "Lika nära delar plats."]);
  });
});
