import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TvStage } from "./TvStage";

describe("TvStage", () => {
  it("draws the screen inside a 16:9 stage that sizes its content", () => {
    render(
      <TvStage>
        <p>Innehåll</p>
      </TvStage>,
    );
    const stage = screen.getByTestId("tv-stage");
    expect(stage).toHaveClass("aspect-video", "@container");
    expect(stage).toContainElement(screen.getByText("Innehåll"));
  });
});
