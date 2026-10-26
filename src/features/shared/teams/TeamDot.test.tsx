import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TeamDot } from "./TeamDot";

describe("TeamDot", () => {
  it("shows the team's shade and stays hidden from screen readers", () => {
    const { container } = render(<TeamDot colour="blue" />);
    const dot = container.firstElementChild as HTMLElement;
    expect(dot).toHaveAttribute("aria-hidden");
    expect(dot.style.background).toBe("rgb(111, 149, 224)");
  });
});
