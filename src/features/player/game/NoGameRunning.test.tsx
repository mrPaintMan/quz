import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NoGameRunning } from "./NoGameRunning";

describe("NoGameRunning", () => {
  it("shows the logo, the message and the way in for the hosts", () => {
    render(<NoGameRunning message="Inget quiz pågår just nu." />);
    expect(screen.getByRole("heading", { name: "Quz" })).toBeInTheDocument();
    expect(screen.getByText("Inget quiz pågår just nu.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "För domare" })).toHaveAttribute("href", "/admin");
  });
});
