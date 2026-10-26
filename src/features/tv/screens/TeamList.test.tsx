import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TeamList } from "./TeamList";

describe("TeamList", () => {
  it("lists the teams", () => {
    render(<TeamList teams={[{ _id: "t1", name: "Tomtarna", colour: "red" }]} emptyText="Inga lag" />);
    expect(screen.getByRole("listitem")).toHaveTextContent("Tomtarna");
  });

  it("says so when there are none", () => {
    render(<TeamList teams={[]} emptyText="Inga lag" />);
    expect(screen.getByText("Inga lag")).toBeInTheDocument();
  });
});
