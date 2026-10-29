import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TeamList } from "./TeamList";

describe("TeamList", () => {
  it("lists the teams", () => {
    render(<TeamList teams={[{ _id: "t1", name: "Tomtarna", colour: "red" }]} emptyText="Inga lag" />);
    expect(screen.getByRole("listitem")).toHaveTextContent("Tomtarna");
  });

  it("shrinks the names when they are long together, so all teams fit the lobby", () => {
    const team = (i: number) => ({ _id: `t${i}`, name: `Tomtenissarnas julklappslag ${i}`, colour: "red" as const });
    const { rerender } = render(<TeamList teams={[team(1)]} emptyText="Inga lag" />);
    expect(screen.getByRole("listitem")).toHaveClass("text-[2cqw]");
    rerender(<TeamList teams={Array.from({ length: 12 }, (_, i) => team(i))} emptyText="Inga lag" />);
    expect(screen.getAllByRole("listitem")[0]).toHaveClass("text-[1.5cqw]");
  });

  it("says so when there are none", () => {
    render(<TeamList teams={[]} emptyText="Inga lag" />);
    expect(screen.getByText("Inga lag")).toBeInTheDocument();
  });
});
