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

  it("gives each string its own glow, so two on one page don't share ids", () => {
    const { container } = render(
      <>
        <ChristmasLights bulbs={4} />
        <ChristmasLights bulbs={4} />
      </>,
    );
    const ids = [...container.querySelectorAll("radialGradient")].map((gradient) => gradient.id);
    expect(new Set(ids).size).toBe(ids.length);
    const glow = container.querySelectorAll("svg")[1].querySelector("circle")!.getAttribute("fill")!;
    expect(container.querySelectorAll("svg")[1].querySelector(`radialGradient[id="${glow.slice(5, -1)}"]`)).not.toBeNull();
  });

  it("keeps a single loop for a short string", () => {
    const { container } = render(<ChristmasLights bulbs={2} />);
    expect(container.querySelectorAll("path")).toHaveLength(1);
    expect(container.querySelectorAll(".julquiz-bulb")).toHaveLength(2);
  });
});
