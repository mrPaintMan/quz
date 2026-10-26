import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LeaderboardScreen } from "./LeaderboardScreen";

describe("LeaderboardScreen", () => {
  it("shows its title and the teams", () => {
    render(<LeaderboardScreen title="Slutresultat" teams={[{ _id: "t1", name: "Tomtarna", colour: "red" }]} />);
    expect(screen.getByRole("heading", { name: "Slutresultat" })).toBeInTheDocument();
    expect(screen.getByText("Tomtarna")).toBeInTheDocument();
  });
});
