import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ActivityEditor } from "./ActivityEditor";

describe("ActivityEditor", () => {
  it("edits the max points", async () => {
    const onChange = vi.fn();
    render(<ActivityEditor content={{ type: "activity", maxPoints: 1 }} onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Maxpoäng"), "0");
    expect(onChange).toHaveBeenLastCalledWith({ type: "activity", maxPoints: 10 });
  });
});
