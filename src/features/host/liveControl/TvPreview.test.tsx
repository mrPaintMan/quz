import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TvPreview } from "./TvPreview";

describe("TvPreview", () => {
  it("shows the screen inside, hidden from screen readers", () => {
    render(
      <TvPreview>
        <h1>Julmat</h1>
      </TvPreview>,
    );
    expect(screen.getByText("Julmat")).toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });
});
