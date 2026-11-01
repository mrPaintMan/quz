import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FilmFrame } from "./FilmFrame";

describe("FilmFrame", () => {
  // jsdom can't lay out, so the sizing itself is checked in a browser; this checks the shape.
  it("gives its content the film's shape", () => {
    render(
      <FilmFrame aspectRatio={4 / 3}>
        <p>Film</p>
      </FilmFrame>,
    );
    const frame = screen.getByText("Film").parentElement!;
    expect(frame.style.aspectRatio).toBe(`${4 / 3} / 1`);
  });
});
