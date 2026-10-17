import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DrawingEditor } from "./DrawingEditor";

describe("DrawingEditor", () => {
  it("edits the max points", async () => {
    const onChange = vi.fn();
    render(<DrawingEditor content={{ type: "drawing", maxPoints: 1 }} onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Maxpoäng"), "0");
    expect(onChange).toHaveBeenLastCalledWith({ type: "drawing", maxPoints: 10 });
  });
});
