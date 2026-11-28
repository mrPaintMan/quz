import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChristmasLights } from "./ChristmasLights";

describe("ChristmasLights", () => {
  it("hangs the bulbs in loops of four, hidden from screen readers", () => {
    const { container } = render(<ChristmasLights bulbs={16} />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelectorAll(".julquiz-bulb")).toHaveLength(16);
    expect(container.querySelectorAll("path")).toHaveLength(4);
  });

  it("starts each bulb at its own point of the slow twinkle, so they never dim together", () => {
    const { container } = render(<ChristmasLights bulbs={8} />);
    const delays = [...container.querySelectorAll<SVGGElement>(".julquiz-bulb")].map((bulb) => bulb.style.animationDelay);
    expect(new Set(delays).size).toBe(8);
  });

  it("keeps a single loop for a short string", () => {
    const { container } = render(<ChristmasLights bulbs={2} />);
    expect(container.querySelectorAll("path")).toHaveLength(1);
    expect(container.querySelectorAll(".julquiz-bulb")).toHaveLength(2);
  });
});
