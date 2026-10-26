import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FollowGame } from "./FollowGame";

describe("FollowGame", () => {
  it("shows the team and what is going on", () => {
    render(<FollowGame team={{ name: "Tomtarna", colour: "red" }} view={{ kind: "lobby" }} />);
    expect(screen.getByText("Tomtarna")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Ni är med! Vi börjar snart.");
  });
});
