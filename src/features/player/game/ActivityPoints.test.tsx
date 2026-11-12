import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { ActivityPoints } from "./ActivityPoints";

const points = vi.fn();
vi.mock("convex/react", () => ({ useQuery: () => points() }));

describe("ActivityPoints", () => {
  it("tells the team its points once the hosts have given them", () => {
    points.mockReturnValue(2.5);
    render(<ActivityPoints teamId={"t1" as Id<"teams">} />);
    expect(screen.getByText("Ni fick 2,5 p för aktiviteten.")).toBeInTheDocument();
  });

  it("shows nothing before then", () => {
    points.mockReturnValue(null);
    const { container } = render(<ActivityPoints teamId={"t1" as Id<"teams">} />);
    expect(container).toBeEmptyDOMElement();
  });
});
