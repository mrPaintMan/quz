import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AnswerKeyField } from "./AnswerKeyField";

describe("AnswerKeyField", () => {
  it("shows the key as text, counts the items and reports parsed changes", async () => {
    const onChange = vi.fn();
    render(<AnswerKeyField label="Facit" value={[{ spellings: ["Oslo"] }]} onChange={onChange} />);
    const input = screen.getByLabelText("Facit");
    expect(input).toHaveValue("Oslo");
    expect(screen.getByText("1 st")).toBeInTheDocument();
    await userEvent.type(input, "{enter}Rom / Roma");
    expect(onChange).toHaveBeenLastCalledWith([{ spellings: ["Oslo"] }, { spellings: ["Rom", "Roma"] }]);
  });

  it("shows a new key given from outside instead of old typed text", () => {
    const { rerender } = render(<AnswerKeyField label="Facit" value={[{ spellings: ["Oslo"] }]} onChange={vi.fn()} />);
    rerender(<AnswerKeyField label="Facit" value={[{ spellings: ["Rom", "Roma"] }]} onChange={vi.fn()} />);
    expect(screen.getByLabelText("Facit")).toHaveValue("Rom / Roma");
  });
});
