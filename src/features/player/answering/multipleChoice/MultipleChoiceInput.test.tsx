import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MultipleChoiceInput } from "./MultipleChoiceInput";

const shown = {
  type: "multipleChoice" as const,
  options: [
    { text: "Sverige", imageId: null },
    { text: "Norge", imageId: null },
  ],
};

describe("MultipleChoiceInput", () => {
  it("picks the option tapped", async () => {
    const onChange = vi.fn();
    render(<MultipleChoiceInput shown={shown} answer={null} imageUrls={{}} disabled={false} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "B Norge" }));
    expect(onChange).toHaveBeenCalledWith({ type: "multipleChoice", optionIndex: 1 });
  });

  it("marks the option picked", () => {
    render(<MultipleChoiceInput shown={shown} answer={{ type: "multipleChoice", optionIndex: 0 }} imageUrls={{}} disabled={false} onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "A Sverige" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "B Norge" })).toHaveAttribute("aria-pressed", "false");
  });

  it("can't change once locked", () => {
    render(<MultipleChoiceInput shown={shown} answer={null} imageUrls={{}} disabled onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "A Sverige" })).toBeDisabled();
  });
});
